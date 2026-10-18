import {createHash,timingSafeEqual} from 'node:crypto';
import type {SliceHttpHost} from './http-api';

export interface WorkspaceSession {
  /** Server-resolved, tenant-scoped actor identity; never supplied by request JSON. */
  actorId:string;
  expiresAt:string;
  csrfToken:string;
  revoked?:boolean;
}
export interface SessionGuardOptions {
  origin:string;
  /** Resolve a SHA-256 digest of the opaque cookie token through the existing auth backend. */
  lookupSession(tokenHash:string):Promise<WorkspaceSession|undefined>;
  cookieName?:string;
  now?:()=>number;
}
export class SessionRequestRejected extends Error {
  constructor(){super('Request origin or CSRF validation failed');}
}
const opaque=/^[A-Za-z0-9_-]{32,256}$/;
export const hashSessionToken=(token:string):string=>createHash('sha256').update(token).digest('hex');
const tokenEqual=(a:string,b:string)=>timingSafeEqual(createHash('sha256').update(a).digest(),createHash('sha256').update(b).digest());

/** Server-only adapter over the host's session backend; does not implement login or session issuance. */
export function createSessionAuthenticator(options:SessionGuardOptions):SliceHttpHost['authenticate']{
  const url=new URL(options.origin);
  if(url.username||url.password||url.pathname!=='/'||url.search||url.hash||
    (url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname))))
    throw new Error('Session origin must be an HTTPS origin (HTTP allowed only on localhost)');
  const cookieName=options.cookieName??'__Host-connectos-session';
  if(!/^[A-Za-z0-9_-]+$/.test(cookieName))throw new Error('Invalid session cookie name');
  const origin=url.origin;
  return async request=>{
    if(new URL(request.url).origin!==origin)throw new SessionRequestRejected();
    const site=request.headers.get('Sec-Fetch-Site');
    if(site&&site!=='same-origin')throw new SessionRequestRejected();
    const cookies=(request.headers.get('Cookie')??'').split(';').map(s=>s.trim())
      .filter(s=>s.slice(0,s.indexOf('='))===cookieName);
    if(cookies.length!==1)return undefined;
    const token=cookies[0].slice(cookieName.length+1);
    if(!opaque.test(token))return undefined;
    const session=await options.lookupSession(hashSessionToken(token));
    const now=(options.now??Date.now)();
    if(!session||session.revoked||!session.actorId.trim()||!Number.isFinite(now)||
      !Number.isFinite(Date.parse(session.expiresAt))||Date.parse(session.expiresAt)<=now||!opaque.test(session.csrfToken))return undefined;
    if(!['GET','HEAD','OPTIONS'].includes(request.method)){
      const csrf=request.headers.get('X-CSRF-Token')??'';
      if(request.headers.get('Origin')!==origin||
        request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase()!=='application/json'||
        !opaque.test(csrf)||!tokenEqual(csrf,session.csrfToken))throw new SessionRequestRejected();
    }
    return session.actorId;
  };
}
