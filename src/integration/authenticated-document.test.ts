import {describe,it,expect,vi} from 'vitest';
import {createServer} from 'node:http';
import type {AddressInfo} from 'node:net';
import {createAuthenticatedDocumentHandler} from './authenticated-document';
import {createSessionAuthenticator,hashSessionToken,type WorkspaceSession} from './session-auth';
import {createNodeApiListener} from './node-http';
import {createSliceHttpHandler} from './http-api';
import type {ConnectOSSlice} from './slice';

const origin='https://workspace.example',cookie='s'.repeat(43),csrf='c'.repeat(43);
const html='<!doctype html><html><head><!-- connectos:csrf --></head><body><div id="root"></div></body></html>';
const session:WorkspaceSession={actorId:'tenant:user',csrfToken:csrf,expiresAt:'2026-10-20T00:00:00Z'};
const now=()=>Date.parse('2026-10-19T00:00:00Z');
const request=(path='/',method='GET',headers:Record<string,string>={})=>new Request(origin+path,
  {method,headers:{Cookie:`__Host-connectos-session=${cookie}`,...headers}});
const make=(record:WorkspaceSession|undefined=session)=>createAuthenticatedDocumentHandler({origin,html,now,lookupSession:async()=>record});

describe('authenticated application document',()=>{
  it('uses the shared opaque session lookup and injects only its validated token',async()=>{
    const lookupSession=vi.fn(async()=>session);
    const handle=createAuthenticatedDocumentHandler({origin,html,now,lookupSession});
    const response=await handle(request('/?run=existing&csrf=attacker','GET',{'Sec-Fetch-Site':'none'}));
    expect(response.status).toBe(200);
    const body=await response.text();
    expect(body).toContain(`<meta name="csrf-token" content="${csrf}">`);
    expect(body).not.toContain('attacker');expect(body).not.toContain(cookie);expect(body).not.toContain(session.actorId);
    expect(lookupSession).toHaveBeenCalledWith(hashSessionToken(cookie));
    expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8');
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(response.headers.get('Vary')).toBe('Cookie');
    expect(response.headers.get('Content-Security-Policy')).toContain("frame-ancestors 'none'");
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });
  it('permits safe top-level navigation from an external site without weakening API metadata checks',async()=>{
    expect((await make()(request('/','GET',{'Sec-Fetch-Site':'cross-site'}))).status).toBe(200);
    await expect(createSessionAuthenticator({origin,now,lookupSession:async()=>session})(request('/','GET',{'Sec-Fetch-Site':'cross-site'})))
      .rejects.toThrow('CSRF validation failed');
  });
  it.each(['','bad',`${cookie}; __Host-connectos-session=${cookie}`])('does not serve the application for invalid or ambiguous cookies',async value=>{
    const response=await make()(request('/','GET',{Cookie:value?`__Host-connectos-session=${value}`:''}));
    expect(response.status).toBe(401);expect(await response.text()).not.toContain(csrf);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  });
  it.each([undefined,{...session,revoked:true},{...session,expiresAt:'2026-10-18T00:00:00Z'},
    {...session,csrfToken:'"><script>bad()</script>'}])('rejects missing, revoked, expired or unsafe session records',async record=>{
    const handle=createAuthenticatedDocumentHandler({origin,html,now,lookupSession:async()=>record});
    const response=await handle(request());expect(response.status).toBe(401);
    expect(await response.text()).not.toContain('<script>');
  });
  it('rechecks sessions and isolates concurrent document responses',async()=>{
    const other='t'.repeat(43),otherCsrf='d'.repeat(43);let revoked=false;
    const handle=createAuthenticatedDocumentHandler({origin,html,now,async lookupSession(hash){
      if(revoked)return undefined;
      return {...session,csrfToken:hash===hashSessionToken(other)?otherCsrf:csrf};
    }});
    const [a,b]=await Promise.all([handle(request()),handle(request('/','GET',{Cookie:`__Host-connectos-session=${other}`}))]);
    expect(await a.text()).not.toContain(otherCsrf);expect(await b.text()).not.toContain(csrf);
    revoked=true;expect((await handle(request())).status).toBe(401);
  });
  it('supports HEAD without returning token bytes',async()=>{
    const response=await make()(request('/','HEAD'));expect(response.status).toBe(200);
    expect(await response.text()).toBe('');expect(response.headers.get('Content-Type')).toContain('text/html');
    const denied=await make()(request('/','HEAD',{Cookie:''}));expect(denied.status).toBe(401);expect(await denied.text()).toBe('');
  });
  it('limits routing and methods before lookup without exposing HTML',async()=>{
    const lookupSession=vi.fn(async()=>session),handle=createAuthenticatedDocumentHandler({origin,html,now,lookupSession});
    const missing=await handle(request('/assets/missing'));expect(missing.status).toBe(404);
    const post=await handle(request('/','POST'));expect(post.status).toBe(405);expect(post.headers.get('Allow')).toBe('GET, HEAD');
    expect(lookupSession).not.toHaveBeenCalled();expect(await post.text()).not.toContain(csrf);
  });
  it('contains backend outages and rejects mismatched request origins',async()=>{
    const handle=createAuthenticatedDocumentHandler({origin,html,lookupSession:async()=>{throw new Error('private provider secret');}});
    const response=await handle(request());expect(response.status).toBe(503);expect(await response.text()).not.toContain('secret');
    expect((await handle(new Request('https://other.example/'))).status).toBe(403);
  });
  it('requires a single explicit token slot in the trusted application template',()=>{
    for(const template of ['<head></head>',html+html])expect(()=>createAuthenticatedDocumentHandler({origin,html:template,lookupSession:async()=>session})).toThrow('exactly one');
  });
  it('serves session HTML through the real Node listener and accepts its token at the existing API',async()=>{
    const server=createServer();await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
    const local=`http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    const options={origin:local,html,now,lookupSession:async()=>session};
    const document=createAuthenticatedDocumentHandler(options);
    const start=vi.fn(async()=>({id:'run-1'}));
    const api=createSliceHttpHandler({start} as unknown as ConnectOSSlice,{authenticate:createSessionAuthenticator(options),
      resolveTargets:async()=>[{entityId:'target',title:'Contact',type:'partnership',signals:{
        relevance:1,fit:1,timing:1,access:1,value:1,urgency:1,competition:0,effort:0,risk:0,confidence:1}}]});
    server.on('request',createNodeApiListener({publicOrigin:local,handler:req=>new URL(req.url).pathname==='/'?document(req):api(req)}));
    try{
      const headers={Cookie:`__Host-connectos-session=${cookie}`};
      const response=await fetch(local,{headers});expect(response.status).toBe(200);
      const token=(await response.text()).match(/name="csrf-token" content="([^"]+)"/)?.[1];expect(token).toBe(csrf);
      const mutate=(token:string)=>fetch(`${local}/api/v2/runs`,{method:'POST',headers:{...headers,Origin:local,
        'Content-Type':'application/json','X-CSRF-Token':token},body:JSON.stringify({goal:'Find a partner',body:'Hello',targetIds:['target']})});
      expect((await mutate('forged')).status).toBe(403);expect(start).not.toHaveBeenCalled();
      expect((await mutate(token!)).status).toBe(201);expect(start).toHaveBeenCalledOnce();
    }finally{server.closeAllConnections();await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}
  });
});
