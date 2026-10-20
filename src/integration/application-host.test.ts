import {afterEach,describe,it,expect,vi} from 'vitest';
import {mkdtemp,mkdir,writeFile,rm,rename,symlink} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {request as httpRequest} from 'node:http';
import {createApplicationHandler,createApplicationServer} from './application-host';

const origin='https://workspace.example',cookie='s'.repeat(43),csrf='c'.repeat(43);
const roots:string[]=[];
afterEach(async()=>{
  for(const root of roots.splice(0)){
    if(!resolve(root).startsWith(join(resolve(tmpdir()),'connectos-host-')))throw new Error('Unexpected cleanup path');
    await rm(root,{recursive:true,force:true});
  }
});
async function build(){
  const directory=await mkdtemp(join(tmpdir(),'connectos-host-'));roots.push(directory);
  await mkdir(join(directory,'assets'));
  await writeFile(join(directory,'index.html'),'<html><head><!-- connectos:csrf --></head><body>ConnectOS</body></html>');
  await writeFile(join(directory,'assets','app-abcd1234.js'),'console.log("app")');
  await writeFile(join(directory,'assets','app-abcd1234.css'),'body{color:black}');
  await writeFile(join(directory,'assets','icon.png'),Buffer.from([0,255,1,2]));
  await writeFile(join(directory,'assets','app.js.map'),'private source map');
  await writeFile(join(directory,'assets','secret.html'),'private template');
  await writeFile(join(directory,'assets','.env'),'private configuration');
  return directory;
}
const options=(buildDirectory:string)=>({origin,buildDirectory,lookupSession:async()=>({actorId:'owner',csrfToken:csrf,
  expiresAt:'2099-01-01T00:00:00Z'}),apiHandler:vi.fn(async()=>Response.json({api:true}))});
const request=(path='/',method='GET',headers:Record<string,string>={})=>new Request(origin+path,{method,
  headers:{Cookie:`__Host-connectos-session=${cookie}`,...headers}});

describe('application host',()=>{
  it('serves authenticated HTML and the existing API without a fallback on unknown API routes',async()=>{
    const config=options(await build());config.apiHandler.mockImplementation(async()=>new Response('API unavailable',{status:503}));
    const handler=await createApplicationHandler(config);
    const document=await handler(request('/?run=existing'));expect(document.status).toBe(200);
    expect(await document.text()).toContain(`content="${csrf}"`);
    expect(document.headers.get('Cache-Control')).toBe('private, no-store');
    expect((await handler(request('/','GET',{Cookie:''}))).status).toBe(401);
    const apiRequest=request('/api/missing');const api=await handler(apiRequest);
    expect(api.status).toBe(503);expect(await api.text()).toBe('API unavailable');
    expect(config.apiHandler).toHaveBeenCalledExactlyOnceWith(apiRequest);
  });
  it.each([['app-abcd1234.js','text/javascript'],['app-abcd1234.css','text/css'],['icon.png','image/png']])('serves public build asset %s with correct MIME and byte length',async(name,type)=>{
    const handler=await createApplicationHandler(options(await build()));
    const response=await handler(request(`/assets/${name}?v=1`,'GET',{Cookie:''}));
    const bytes=new Uint8Array(await response.arrayBuffer());
    expect(response.status).toBe(200);expect(response.headers.get('Content-Type')).toContain(type);
    expect(Number(response.headers.get('Content-Length'))).toBe(bytes.length);
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    if(name==='icon.png')expect([...bytes]).toEqual([0,255,1,2]);
  });
  it('supports HEAD and conditional asset revalidation while keeping HTML private',async()=>{
    const handler=await createApplicationHandler(options(await build()));
    const first=await handler(request('/assets/icon.png'));
    const etag=first.headers.get('ETag')!;
    expect(first.headers.get('Cache-Control')).toBe('public, max-age=0, must-revalidate');
    for(const tag of [etag,`W/${etag}`,`"old", ${etag}`,'*']){
      const cached=await handler(request('/assets/icon.png','GET',{'If-None-Match':tag}));
      expect(cached.status).toBe(304);expect(await cached.text()).toBe('');
    }
    expect((await handler(request('/assets/icon.png','GET',{'If-None-Match':'"other"'}))).status).toBe(200);
    const head=await handler(request('/assets/icon.png','HEAD'));expect(await head.text()).toBe('');
    expect(head.headers.get('Content-Length')).toBe('4');
    expect((await handler(request('/','GET',{'If-None-Match':etag}))).status).toBe(200);
  });
  it.each(['/index.html','/missing','/api','/assets/app.js.map','/assets/secret.html','/assets/.env',
    '/assets/nested/app.js','/assets/%2e%2e/index.html','/assets/%2findex.html','/assets/..%5cindex.html'])('never falls back to HTML or private files: %s',async path=>{
    const config=options(await build()),handler=await createApplicationHandler(config);
    const response=await handler(request(path));expect(response.status).toBe(404);
    expect(await response.text()).toBe('Not found');expect(config.apiHandler).not.toHaveBeenCalled();
  });
  it('rejects asset mutations and mismatched origins before application dispatch',async()=>{
    const config=options(await build()),handler=await createApplicationHandler(config);
    const post=await handler(request('/assets/icon.png','POST'));expect(post.status).toBe(405);
    expect(post.headers.get('Allow')).toBe('GET, HEAD');
    expect((await handler(new Request('https://other.example/api/v2/targets'))).status).toBe(403);
    expect(config.apiHandler).not.toHaveBeenCalled();
  });
  it('snapshots the build once instead of reading paths selected by requests',async()=>{
    const directory=await build(),handler=await createApplicationHandler(options(directory));
    await writeFile(join(directory,'assets','icon.png'),'changed');
    await writeFile(join(directory,'assets','new.js'),'new');
    expect([...new Uint8Array(await (await handler(request('/assets/icon.png'))).arrayBuffer())]).toEqual([0,255,1,2]);
    expect((await handler(request('/assets/new.js'))).status).toBe(404);
  });
  it('fails startup on a missing build or token slot and rejects a linked asset directory',async()=>{
    const directory=await build();
    await expect(createApplicationHandler(options(join(directory,'missing')))).rejects.toThrow();
    await writeFile(join(directory,'index.html'),'<html>No slot</html>');
    await expect(createApplicationHandler(options(directory))).rejects.toThrow('CSRF slot');
    await writeFile(join(directory,'index.html'),'<!-- connectos:csrf -->');
    await rename(join(directory,'assets'),join(directory,'published'));
    await symlink(join(directory,'published'),join(directory,'assets'),'junction');
    await expect(createApplicationHandler(options(directory))).rejects.toThrow('regular');
  });
  it('bounds asset memory before loading oversized files',async()=>{
    const directory=await build();await writeFile(join(directory,'assets','large.js'),Buffer.alloc(16*1024*1024+1));
    await expect(createApplicationHandler(options(directory))).rejects.toThrow('snapshot exceeds limit');
  });
  it('provides an unbound Node server with pinned authority and bounded requests',async()=>{
    const server=await createApplicationServer({...options(await build()),maxRequestBytes:4});
    expect(server.listening).toBe(false);expect(server.requestTimeout).toBe(15000);expect(server.headersTimeout).toBe(10000);
    await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
    const address=server.address();if(!address||typeof address==='string')throw new Error('Missing port');
    const call=(host:string,method='GET',body='')=>new Promise<{status:number;body:string}>((resolve,reject)=>{
      const req=httpRequest({hostname:'127.0.0.1',port:address.port,path:'/assets/icon.png',method,headers:{Host:host}},res=>{
        let text='';res.on('data',part=>{text+=part;});res.on('end',()=>resolve({status:res.statusCode!,body:text}));
      });req.on('error',reject);req.end(body);
    });
    try{
      expect((await call('workspace.example')).status).toBe(200);
      expect((await call('attacker.example')).status).toBe(400);
      expect((await call('workspace.example','POST','12345')).status).toBe(413);
    }finally{server.closeAllConnections();await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}
  });
});
