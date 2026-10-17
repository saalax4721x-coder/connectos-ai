import type {SliceView} from './slice';

export interface WorkspaceTarget {id:string;title:string;type:string;}
export interface StartRunInput {goal:string;body:string;targetIds:string[];}
export class WorkspaceError extends Error {
  constructor(message:string,readonly status?:number,readonly uncertain=false){super(message);}
}
export interface WorkspaceClient {
  targets():Promise<WorkspaceTarget[]>;
  start(input:StartRunInput):Promise<SliceView>;
  get(id:string):Promise<SliceView>;
  decide(id:string,decision:'approve'|'reject'):Promise<SliceView>;
}
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const text=(v:unknown):v is string=>typeof v==='string'&&v.length>0;
const states=new Set(['pending','running','waiting-approval','succeeded','failed','cancelled']);

/** Validate the review fields before rendering server data. Never import engines into the browser. */
export function parseRun(value:unknown):SliceView{
  if(!object(value)||!object(value.run)||!text(value.run.id)||!states.has(String(value.run.state))||
    !Array.isArray(value.run.steps)||!value.run.steps.every(s=>object(s)&&text(s.id)&&text(s.name)&&states.has(String(s.state))&&
      (s.error===undefined||typeof s.error==='string')))throw new WorkspaceError('Your workspace returned an unreadable run. Refresh its status.');
  if(value.action!==undefined&&(!object(value.action)||value.action.tool!=='send-message'||!text(value.action.recipientId)||
    !text(value.action.body)||!text(value.action.opportunityId)||!text(value.action.idempotencyKey)))
    throw new WorkspaceError('Your workspace returned an incomplete action. Refresh its status.');
  if(value.intelligence!==undefined){
    const i=value.intelligence;
    if(!object(i)||!object(i.research)||!Array.isArray(i.research.findings)||!i.research.findings.every(f=>object(f)&&
      text(f.entityId)&&text(f.claim)&&text(f.value)&&typeof f.confidence==='number'&&Number.isFinite(f.confidence)&&
      Array.isArray(f.sourceIds)&&f.sourceIds.every(text))||!Array.isArray(i.warmPaths)||
      !i.warmPaths.every(p=>object(p)&&text(p.from)&&text(p.to)&&typeof p.requiresConsent==='boolean'))
      throw new WorkspaceError('Your workspace returned incomplete evidence. Refresh its status.');
  }
  return value as unknown as SliceView;
}

export function createWorkspaceClient(options:{fetch?:typeof fetch;csrfToken?:()=>string|undefined;timeoutMs?:number}={}):WorkspaceClient{
  const request=async(path:string,body?:unknown):Promise<unknown>=>{
    const mutation=body!==undefined;
    let response:Response;
    try{
      const token=options.csrfToken?.();
      response=await (options.fetch??fetch)(path,{method:mutation?'POST':'GET',credentials:'same-origin',
        headers:{Accept:'application/json',...(mutation?{'Content-Type':'application/json'}:{}),...(mutation&&token?{'X-CSRF-Token':token}:{})},
        body:mutation?JSON.stringify(body):undefined,signal:AbortSignal.timeout(options.timeoutMs??30000),redirect:'error'});
    }catch{
      throw new WorkspaceError(mutation?'The connection was interrupted. Refresh the run status before trying another action.':
        'Your workspace is unavailable. Try connecting again.',undefined,mutation);
    }
    if(response.status===401)throw new WorkspaceError('Your session has expired. Sign in to your workspace, then try again.',401);
    if(response.status===403)throw new WorkspaceError('Your workspace did not authorize this request. Refresh your session and try again.',403);
    if(response.status===404)throw new WorkspaceError('This run is unavailable or belongs to another workspace.',404);
    if(!response.ok)throw new WorkspaceError('Your workspace could not complete the request. Refresh its status and try again.',response.status,mutation);
    if(!response.headers.get('Content-Type')?.includes('application/json'))throw new WorkspaceError('Your workspace service is unavailable. Try connecting again.');
    try{return await response.json();}catch{throw new WorkspaceError('Your workspace returned an unreadable response. Refresh its status.',undefined,mutation);}
  };
  return {
    async targets(){
      const value=await request('/api/v2/targets');
      if(!Array.isArray(value)||!value.every(t=>object(t)&&text(t.id)&&text(t.title)&&text(t.type)))
        throw new WorkspaceError('Your workspace returned an unreadable contact list.');
      return value as WorkspaceTarget[];
    },
    async start(input){return parseRun(await request('/api/v2/runs',input));},
    async get(id){return parseRun(await request(`/api/v2/runs/${encodeURIComponent(id)}`));},
    async decide(id,decision){return parseRun(await request(`/api/v2/runs/${encodeURIComponent(id)}/decision`,{decision}));},
  };
}
