import type {IncomingMessage,ServerResponse,RequestListener} from 'node:http';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import type {ReadableStream as NodeReadableStream} from 'node:stream/web';

export interface NodeApiOptions {
  publicOrigin:string;
  handler(request:Request):Promise<Response>;
  maxRequestBytes?:number;
}

/** Server-only transport for the existing authenticated Fetch API handler. */
export function createNodeApiListener(options:NodeApiOptions):RequestListener{
  const configured=new URL(options.publicOrigin);
  if(configured.username||configured.password||configured.pathname!=='/'||configured.search||configured.hash||
    (configured.protocol!=='https:'&&!(configured.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(configured.hostname))))
    throw new Error('Public origin must be HTTPS (HTTP allowed only on localhost)');
  const origin=configured.origin;
  const allowedHosts=new Set([configured.host,`${configured.hostname}:${configured.port||(configured.protocol==='https:'?'443':'80')}`]);
  const limit=options.maxRequestBytes??256*1024;
  if(!Number.isSafeInteger(limit)||limit<1||limit>16*1024*1024)throw new Error('Invalid request byte limit');

  const sendError=(req:IncomingMessage,res:ServerResponse,status:number,message:string)=>{
    if(res.destroyed||res.writableEnded)return;
    if(res.headersSent){res.destroy();return;}
    res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','Connection':'close'});
    res.end(JSON.stringify({error:message}));
    req.resume();
  };

  const dispatch=async(req:IncomingMessage,res:ServerResponse)=>{
    const controller=new AbortController();
    const abort=()=>controller.abort();
    const close=()=>{if(!res.writableFinished)abort();};
    req.once('aborted',abort);res.once('close',close);
    try{
      const hostCount=req.rawHeaders.filter((_,index)=>index%2===0&&req.rawHeaders[index].toLowerCase()==='host').length;
      if(hostCount!==1||!req.headers.host||!allowedHosts.has(req.headers.host.toLowerCase())){
        sendError(req,res,400,'Invalid request host');return;
      }
      if(!req.url?.startsWith('/')||req.url.startsWith('//')){sendError(req,res,400,'Invalid request target');return;}
      const url=new URL(req.url,origin);
      if(url.origin!==origin){sendError(req,res,400,'Invalid request target');return;}
      const length=req.headers['content-length'];
      if(length!==undefined&&(!/^\d+$/.test(length)||Number(length)>limit)){
        sendError(req,res,413,'Request body exceeds limit');return;
      }
      const encoding=req.headers['content-encoding'];
      if(encoding&&encoding!=='identity'){sendError(req,res,415,'Encoded request bodies are not supported');return;}
      const chunks:Buffer[]=[];let bytes=0;
      for await(const chunk of req.iterator({destroyOnReturn:false})){
        const data=Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk);
        bytes+=data.length;
        if(bytes>limit){sendError(req,res,413,'Request body exceeds limit');return;}
        chunks.push(data);
      }
      const method=req.method??'GET';
      if(bytes&&['GET','HEAD'].includes(method)){sendError(req,res,400,'Request method does not accept a body');return;}
      const headers=new Headers();
      for(const [name,value] of Object.entries(req.headers))if(value!==undefined)
        headers.set(name,Array.isArray(value)?value.join(name==='cookie'?'; ':', '):value);
      const request=new Request(url,{method,headers,body:bytes?Buffer.concat(chunks):undefined,signal:controller.signal});
      const response=await options.handler(request);
      if(res.destroyed||controller.signal.aborted){await response.body?.cancel();return;}
      res.statusCode=response.status;
      response.headers.forEach((value,name)=>{if(name!=='set-cookie')res.setHeader(name,value);});
      const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);
      if(method==='HEAD'||!response.body){await response.body?.cancel();res.end();return;}
      await pipeline(Readable.fromWeb(response.body as NodeReadableStream<Uint8Array>),res);
    }catch{
      sendError(req,res,500,'Request could not be completed');
    }finally{
      req.off('aborted',abort);res.off('close',close);
    }
  };
  return (req,res)=>{void dispatch(req,res);};
}
