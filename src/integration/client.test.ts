import {describe,it,expect,vi} from 'vitest';
import {createWorkspaceClient,WorkspaceError,parseRun} from './client';
const run={run:{id:'run-1',state:'waiting-approval',steps:[{id:'outreach',name:'Send outreach',state:'waiting-approval'}]},
  action:{tool:'send-message',recipientId:'p1',opportunityId:'o1',body:'Hello',idempotencyKey:'run-1:outreach'}};

describe('workspace browser client',()=>{
  it('uses same-origin session and CSRF without client-supplied identity or scoring',async()=>{
    const fetch=vi.fn<typeof globalThis.fetch>().mockResolvedValue(Response.json(run));
    const client=createWorkspaceClient({fetch,csrfToken:()=> 'session-csrf'});
    const input={goal:'Find partners',body:'Hello',targetIds:['p1']};
    expect(await client.start(input)).toEqual(run);
    expect(fetch.mock.calls[0]).toMatchObject(['/api/v2/runs',{method:'POST',credentials:'same-origin',redirect:'error',
      headers:{'X-CSRF-Token':'session-csrf'},body:JSON.stringify(input)}]);
  });
  it('encodes run identifiers rather than accepting URL fragments',async()=>{
    const fetch=vi.fn<typeof globalThis.fetch>().mockResolvedValue(Response.json(run));
    await createWorkspaceClient({fetch}).get('run/other?actor=intruder');
    expect(fetch.mock.calls[0][0]).toBe('/api/v2/runs/run%2Fother%3Factor%3Dintruder');
  });
  it('does not retry a consequential mutation after a connection failure',async()=>{
    const fetch=vi.fn<typeof globalThis.fetch>().mockRejectedValue(new Error('connection lost'));
    let error:unknown;try{await createWorkspaceClient({fetch}).decide('r','approve');}catch(e){error=e;}
    expect(error).toBeInstanceOf(WorkspaceError);expect((error as WorkspaceError).uncertain).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it.each([401,403,404,503])('reports HTTP %s instead of fabricated success',async status=>{
    const fetch=vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response('',{status}));
    await expect(createWorkspaceClient({fetch}).targets()).rejects.toMatchObject({status});
  });
  it('rejects the HTML fallback returned by an unconfigured web host',async()=>{
    const fetch=vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response('<html></html>',{headers:{'Content-Type':'text/html'}}));
    await expect(createWorkspaceClient({fetch}).targets()).rejects.toThrow('service is unavailable');
  });
  it('rejects incomplete contact and approval responses',async()=>{
    expect(()=>parseRun({...run,action:{body:'missing recipient'}})).toThrow('incomplete action');
    expect(()=>parseRun({run:{id:'r',state:'unknown',steps:[]}})).toThrow('unreadable run');
    const fetch=vi.fn<typeof globalThis.fetch>().mockResolvedValue(Response.json([{id:'p1'}]));
    await expect(createWorkspaceClient({fetch}).targets()).rejects.toThrow('unreadable contact list');
  });
});
