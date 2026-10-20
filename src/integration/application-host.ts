import {createServer} from 'node:http';
import {lstat,readFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {createAuthenticatedDocumentHandler} from './authenticated-document';
import {createNodeApiListener} from './node-http';
import type {SessionGuardOptions} from './session-auth';

export interface ApplicationHostOptions extends SessionGuardOptions {
  buildDirectory:string;
  /** Existing authenticated createSliceHttpHandler instance; use the same session options. */
  apiHandler(request:Request):Promise<Response>;
  maxRequestBytes?:number;
}
const mime:Record<string,string>={'.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8',
  '.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp',
  '.avif':'image/avif','.ico':'image/x-icon','.woff':'font/woff','.woff2':'font/woff2'};

/** Snapshot a trusted Vite build once; request paths never select filesystem paths. */
export async function createApplicationHandler(options:ApplicationHostOptions){
  const index=join(options.buildDirectory,'index.html'),directory=join(options.buildDirectory,'assets');
  if(!(await lstat(index)).isFile()||!(await lstat(directory)).isDirectory())throw new Error('Build requires regular index.html and assets directory');
  const document=createAuthenticatedDocumentHandler({...options,html:await readFile(index,'utf8')});
  const origin=new URL(options.origin).origin;
  const assets=new Map<string,{body:Uint8Array<ArrayBuffer>;type:string;etag:string}>();
  let total=0;
  for(const entry of await readdir(directory,{withFileTypes:true})){
    const extension=entry.name.match(/\.[a-z0-9]+$/)?.[0];
    if(!entry.isFile()||!extension||!mime[extension]||!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(entry.name))continue;
    const path=join(directory,entry.name);
    const info=await lstat(path);
    if(!info.isFile())throw new Error('Build asset must be a regular file');
    if(info.size>16*1024*1024||total+info.size>64*1024*1024)throw new Error('Build asset snapshot exceeds limit');
    const body=new Uint8Array(await readFile(path));total+=body.length;
    if(body.length>16*1024*1024||total>64*1024*1024)throw new Error('Build asset snapshot exceeds limit');
    assets.set(`/assets/${entry.name}`,{body,type:mime[extension],etag:`"${createHash('sha256').update(body).digest('hex')}"`});
  }
  return async(request:Request):Promise<Response>=>{
    const url=new URL(request.url);
    // The Node transport also pins Host; keep direct Fetch callers on the configured origin.
    if(url.origin!==origin)return new Response('Request is not authorized',{status:403,headers:{'Cache-Control':'no-store'}});
    if(url.pathname.startsWith('/api/'))return options.apiHandler(request);
    const asset=assets.get(url.pathname);
    if(!asset)return document(request);
    const headers={'Content-Type':asset.type,'Cache-Control':'public, max-age=0, must-revalidate',
      'X-Content-Type-Options':'nosniff',ETag:asset.etag};
    if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',
      {status:405,headers:{Allow:'GET, HEAD','Cache-Control':'no-store'}});
    if(request.headers.get('If-None-Match')?.split(',').some(tag=>tag.trim()==='*'||tag.trim().replace(/^W\//,'')===asset.etag))
      return new Response(null,{status:304,headers});
    return new Response(request.method==='HEAD'?null:asset.body,{headers:{...headers,'Content-Length':String(asset.body.length)}});
  };
}

/** Unbound server: the owning host chooses its private listener and shutdown policy. */
export async function createApplicationServer(options:ApplicationHostOptions){
  const handler=await createApplicationHandler(options);
  return createServer({requestTimeout:15000,headersTimeout:10000},createNodeApiListener({
    publicOrigin:options.origin,handler,maxRequestBytes:options.maxRequestBytes,
  }));
}
