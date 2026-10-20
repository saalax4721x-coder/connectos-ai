import {createSessionResolver,SessionRequestRejected,type SessionGuardOptions} from './session-auth';

export interface AuthenticatedDocumentOptions extends SessionGuardOptions {
  /** Trusted built application HTML containing exactly one <!-- connectos:csrf --> slot. */
  html:string;
}
const slot='<!-- connectos:csrf -->';

/** Serve the root application document using the existing host session backend. */
export function createAuthenticatedDocumentHandler(options:AuthenticatedDocumentOptions){
  if(options.html.split(slot).length!==2)throw new Error('HTML must contain exactly one CSRF slot');
  const resolveSession=createSessionResolver(options);
  return async(request:Request):Promise<Response>=>{
    const headers={
      'Cache-Control':'private, no-store','Vary':'Cookie','X-Content-Type-Options':'nosniff',
      'Referrer-Policy':'same-origin',
      'Content-Security-Policy':"frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
    };
    const reply=(body:string,status:number,extra:Record<string,string>={})=>new Response(request.method==='HEAD'?null:body,
      {status,headers:{...headers,'Content-Type':'text/plain; charset=utf-8',...extra}});
    if(new URL(request.url).pathname!=='/')return reply('Not found',404);
    if(!['GET','HEAD'].includes(request.method))return reply('Method not allowed',405,{Allow:'GET, HEAD'});
    try{
      const session=await resolveSession(request);
      if(!session)return reply('Sign in to your workspace, then reload this page.',401);
      // The resolver accepts only base64url CSRF tokens, safe in a quoted HTML attribute.
      const html=options.html.replace(slot,`<meta name="csrf-token" content="${session.csrfToken}">`);
      return reply(html,200,{'Content-Type':'text/html; charset=utf-8'});
    }catch(error){
      return error instanceof SessionRequestRejected?reply('Request is not authorized',403):
        reply('Sign-in service unavailable. Please try again.',503);
    }
  };
}
