import {describe,it,expect,vi} from 'vitest';
import {createSessionAuthenticator,hashSessionToken,SessionRequestRejected,type WorkspaceSession} from './session-auth';
import {createSliceHttpHandler} from './http-api';
import type {ConnectOSSlice} from './slice';

const origin='https://workspace.example';
const cookie='s'.repeat(43),csrf='c'.repeat(43);
const now=Date.parse('2026-10-18T12:00:00Z');
const session:WorkspaceSession={actorId:'tenant-a:user-1',expiresAt:'2026-10-18T13:00:00Z',csrfToken:csrf};
const request=(method='GET',patch:Record<string,string>={})=>new Request(`${origin}/api/v2/targets`,{
  method,headers:{Cookie:`__Host-connectos-session=${cookie}`,Origin:origin,'Content-Type':'application/json',
    'X-CSRF-Token':csrf,'Sec-Fetch-Site':'same-origin',...patch},body:method==='POST'?'{}':undefined});
const guard=(record:WorkspaceSession|undefined=session)=>createSessionAuthenticator({origin,now:()=>now,lookupSession:async()=>record});

describe('host session and CSRF guard',()=>{
  it('resolves identity through a hashed opaque session token',async()=>{
    const lookupSession=vi.fn(async(_tokenHash:string)=>session);
    const authenticate=createSessionAuthenticator({origin,now:()=>now,lookupSession});
    expect(await authenticate(request())).toBe('tenant-a:user-1');
    expect(lookupSession).toHaveBeenCalledWith(hashSessionToken(cookie));
    expect(lookupSession.mock.calls[0][0]).not.toBe(cookie);
    expect(await authenticate(request('POST'))).toBe(session.actorId);
  });
  it.each(['','invalid','s'.repeat(257)])('rejects missing or malformed cookies without lookup: %s',async value=>{
    const lookupSession=vi.fn(async()=>session);
    const authenticate=createSessionAuthenticator({origin,now:()=>now,lookupSession});
    expect(await authenticate(request('GET',{Cookie:value?`__Host-connectos-session=${value}`:''}))).toBeUndefined();
    expect(lookupSession).not.toHaveBeenCalled();
  });
  it('rejects ambiguous duplicate cookies',async()=>{
    expect(await guard()(request('GET',{Cookie:`__Host-connectos-session=${cookie}; __Host-connectos-session=${cookie}`}))).toBeUndefined();
  });
  it.each([{...session,revoked:true},{...session,expiresAt:'2026-10-18T12:00:00Z'},
    {...session,expiresAt:'invalid'},{...session,actorId:' '},{...session,csrfToken:'short'}])('rejects invalid session records',async record=>{
    expect(await guard(record)(request())).toBeUndefined();
  });
  it('rechecks revocation for every request',async()=>{
    let record:WorkspaceSession|undefined=session;
    const authenticate=createSessionAuthenticator({origin,now:()=>now,lookupSession:async()=>record});
    expect(await authenticate(request())).toBe(session.actorId);record=undefined;
    expect(await authenticate(request())).toBeUndefined();
  });
  it.each([{Origin:'https://attacker.example'},{Origin:'null'},{Origin:''},{'X-CSRF-Token':''},
    {'X-CSRF-Token':'x'.repeat(43)},{'Content-Type':'text/plain'},{'Sec-Fetch-Site':'same-site'},
    {'Sec-Fetch-Site':'cross-site'}] as Record<string,string>[])('rejects forged mutations: %j',async headers=>{
    await expect(guard()(request('POST',headers))).rejects.toBeInstanceOf(SessionRequestRejected);
  });
  it('rejects a different request origin even with a valid cookie and token',async()=>{
    await expect(guard()(new Request('https://other.example/api/v2/targets',{headers:{Cookie:`__Host-connectos-session=${cookie}`}})))
      .rejects.toBeInstanceOf(SessionRequestRejected);
  });
  it('requires a secure deployment origin and a valid cookie name',()=>{
    for(const value of ['http://remote.example','https://workspace.example/path','https://workspace.example?key=x','https://user:pass@workspace.example'])
      expect(()=>createSessionAuthenticator({origin:value,lookupSession:async()=>session})).toThrow('HTTPS origin');
    expect(()=>createSessionAuthenticator({origin,cookieName:'invalid;cookie',lookupSession:async()=>session})).toThrow('cookie name');
  });
  it('keeps authentication outages contained without exposing backend errors',async()=>{
    const authenticate=createSessionAuthenticator({origin,lookupSession:async()=>{throw new Error('private backend detail');}});
    const handler=createSliceHttpHandler({} as ConnectOSSlice,{authenticate,resolveTargets:async()=>[]});
    const response=await handler(request());
    expect(response.status).toBe(503);expect(await response.text()).not.toContain('private backend detail');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
  it('returns 403 for rejected CSRF before invoking the application',async()=>{
    const handler=createSliceHttpHandler({} as ConnectOSSlice,{authenticate:guard(),resolveTargets:async()=>[]});
    expect((await handler(request('POST',{'X-CSRF-Token':''}))).status).toBe(403);
  });
});
