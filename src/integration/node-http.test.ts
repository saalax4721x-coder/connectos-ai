import {createServer,request as httpRequest,type IncomingHttpHeaders} from 'node:http';
import {once} from 'node:events';
import {afterEach,describe,it,expect,vi} from 'vitest';
import {createNodeApiListener,type NodeApiOptions} from './node-http';
import {createSliceHttpHandler} from './http-api';
import {createSessionAuthenticator,hashSessionToken} from './session-auth';
import type {ConnectOSSlice} from './slice';

const cleanups:Array<()=>Promise<void>>=[];
afterEach(async()=>{for(const close of cleanups.splice(0))await close();});
async function host(handler:NodeApiOptions['handler'],maxRequestBytes?:number){
  const server=createServer();server.listen(0,'127.0.0.1');await once(server,'listening');
  const address=server.address();if(!address||typeof address==='string')throw new Error('No test port');
  const origin=`http://127.0.0.1:${address.port}`;
  server.on('request',createNodeApiListener({publicOrigin:origin,handler,maxRequestBytes}));
  cleanups.push(()=>new Promise<void>((resolve,reject)=>{server.close(e=>e?reject(e):resolve());server.closeAllConnections();}));
  return {origin,port:address.port};
}
async function raw(port:number,options:{method?:string;path?:string;headers?:IncomingHttpHeaders;chunks?:string[]}={}){
  return new Promise<{status:number;body:string;headers:IncomingHttpHeaders}>((resolve,reject)=>{
    const req=httpRequest({hostname:'127.0.0.1',port,method:options.method??'GET',path:options.path??'/api/v2/targets',headers:options.headers},res=>{
      let body='';res.on('data',chunk=>{body+=chunk;});res.on('end',()=>resolve({status:res.statusCode!,body,headers:res.headers}));res.on('error',reject);
    });
    req.on('error',reject);for(const chunk of options.chunks??[])req.write(chunk);req.end();
  });
}

describe('Node API transport',()=>{
  it('preserves request identity, headers, query and UTF-8 body',async()=>{
    const f=await host(async req=>Response.json({url:req.url,method:req.method,cookie:req.headers.get('cookie'),body:await req.json()}));
    const response=await fetch(`${f.origin}/api/v2/runs?view=review`,{method:'POST',headers:{Cookie:'session=opaque','Content-Type':'application/json'},
      body:JSON.stringify({goal:'Iskaashi — تعاون'})});
    expect(await response.json()).toEqual({url:`${f.origin}/api/v2/runs?view=review`,method:'POST',cookie:'session=opaque',body:{goal:'Iskaashi — تعاون'}});
  });
  it('rejects oversized declared bodies without invoking the application',async()=>{
    const handler=vi.fn(async()=>Response.json({ok:true}));const f=await host(handler,8);
    const response=await raw(f.port,{method:'POST',headers:{'Content-Length':'9'},chunks:['123456789']});
    expect(response.status).toBe(413);expect(handler).not.toHaveBeenCalled();
  });
  it('enforces the byte limit for chunked UTF-8 bodies',async()=>{
    const handler=vi.fn(async()=>Response.json({ok:true}));const f=await host(handler,5);
    const response=await raw(f.port,{method:'POST',headers:{'Transfer-Encoding':'chunked'},chunks:['éé','é']});
    expect(response.status).toBe(413);expect(handler).not.toHaveBeenCalled();
  });
  it.each(['attacker.example','user@localhost','invalid host'])('rejects unexpected Host: %s',async hostHeader=>{
    const handler=vi.fn(async()=>Response.json({ok:true}));const f=await host(handler);
    expect((await raw(f.port,{headers:{Host:hostHeader}})).status).toBe(400);expect(handler).not.toHaveBeenCalled();
  });
  it('does not derive the request origin from forwarding headers',async()=>{
    const f=await host(async req=>Response.json({origin:new URL(req.url).origin}));
    const response=await fetch(f.origin,{headers:{'X-Forwarded-Host':'attacker.example','X-Forwarded-Proto':'http'}});
    expect(await response.json()).toEqual({origin:f.origin});
  });
  it.each(['http://attacker.example/api/v2/targets','//attacker.example/api/v2/targets','/\\attacker.example/api/v2/targets'])('rejects cross-origin request targets: %s',async path=>{
    const handler=vi.fn(async()=>Response.json({ok:true}));const f=await host(handler);
    expect((await raw(f.port,{path})).status).toBe(400);expect(handler).not.toHaveBeenCalled();
  });
  it('rejects compressed bodies rather than passing ambiguous content to the API',async()=>{
    const handler=vi.fn(async()=>Response.json({ok:true}));const f=await host(handler);
    expect((await raw(f.port,{method:'POST',headers:{'Content-Encoding':'gzip'},chunks:['compressed']})).status).toBe(415);
    expect(handler).not.toHaveBeenCalled();
  });
  it('preserves streamed binary data, status and separate Set-Cookie headers',async()=>{
    const f=await host(async()=>new Response(new ReadableStream({start(c){c.enqueue(new Uint8Array([0,255]));c.enqueue(new Uint8Array([1,2]));c.close();}}),
      {status:202,headers:[['Content-Type','application/octet-stream'],['Set-Cookie','one=1; HttpOnly'],['Set-Cookie','two=2; HttpOnly']]}));
    const response=await fetch(f.origin);
    expect(response.status).toBe(202);expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([0,255,1,2]);
    expect(response.headers.getSetCookie()).toEqual(['one=1; HttpOnly','two=2; HttpOnly']);
  });
  it('suppresses the body for HEAD responses',async()=>{
    const f=await host(async()=>new Response('private body',{headers:{'X-Result':'ready'}}));
    const response=await fetch(f.origin,{method:'HEAD'});
    expect(await response.text()).toBe('');expect(response.headers.get('X-Result')).toBe('ready');
  });
  it('contains unexpected application failures without disclosing details',async()=>{
    const f=await host(async()=>{throw new Error('private credential or database detail');});
    const response=await fetch(f.origin);expect(response.status).toBe(500);
    expect(await response.text()).not.toContain('private credential');expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
  it('passes real session and CSRF checks through the existing API handler',async()=>{
    const token='s'.repeat(43),csrf='c'.repeat(43);let handler:NodeApiOptions['handler']=async()=>new Response(null,{status:503});
    const f=await host(req=>handler(req));
    handler=createSliceHttpHandler({} as ConnectOSSlice,{
      authenticate:createSessionAuthenticator({origin:f.origin,async lookupSession(hash){return hash===hashSessionToken(token)?
        {actorId:'owner',csrfToken:csrf,expiresAt:new Date(Date.now()+60000).toISOString()}:undefined;}}),
      listTargets:async()=>[],resolveTargets:async()=>[],
    });
    expect((await fetch(`${f.origin}/api/v2/targets`)).status).toBe(401);
    const headers={Cookie:`__Host-connectos-session=${token}`,Origin:f.origin,'Content-Type':'application/json'};
    expect((await fetch(`${f.origin}/api/v2/targets`,{headers})).status).toBe(200);
    expect((await fetch(`${f.origin}/api/v2/runs`,{method:'POST',headers,body:'{}'})).status).toBe(403);
    expect((await fetch(`${f.origin}/api/v2/runs`,{method:'POST',headers:{...headers,'X-CSRF-Token':csrf},body:'{}'})).status).toBe(400);
  });
  it('aborts the Fetch request signal when the HTTP client disconnects',async()=>{
    let seen:()=>void=()=>{};const aborted=new Promise<void>(resolve=>{seen=resolve;});
    const f=await host(async req=>new Promise<Response>(resolve=>{
      req.signal.addEventListener('abort',()=>{seen();resolve(new Response(null,{status:499}));},{once:true});
      disconnect();
    }));
    let disconnect:()=>void=()=>{};
    const req=httpRequest(f.origin);req.on('error',()=>{});disconnect=()=>req.destroy();req.end();
    await aborted;
  });
  it('validates transport configuration before accepting requests',()=>{
    const handler=async()=>new Response('ok');
    expect(()=>createNodeApiListener({publicOrigin:'http://remote.example',handler})).toThrow('HTTPS');
    expect(()=>createNodeApiListener({publicOrigin:'https://workspace.example/path',handler})).toThrow('HTTPS');
    for(const limit of [0,NaN,Infinity,1.5,17*1024*1024])expect(()=>createNodeApiListener({publicOrigin:'https://workspace.example',handler,maxRequestBytes:limit})).toThrow('byte limit');
  });
});
