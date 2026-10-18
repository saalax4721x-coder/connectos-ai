import type {ConnectOSSlice} from './slice';
import type {ResearchTarget} from './adapters';

export interface SliceHttpHost {
  /** Authenticate each request and enforce CSRF/session policy for mutations. */
  authenticate(request:Request):Promise<string|undefined>;
  /** Resolve authorized targets and domain signals server-side; never trust client scores. */
  resolveTargets(actorId:string,entityIds:string[]):Promise<ResearchTarget[]>;
}
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const text=(v:unknown,max:number):v is string=>typeof v==='string'&&v.trim().length>0&&v.length<=max;

/** Mount on the authenticated host. Provider credentials and engines stay server-side. */
export function createSliceHttpHandler(slice:ConnectOSSlice,host:SliceHttpHost){
  const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
  return async(request:Request):Promise<Response>=>{
    const actorId=await host.authenticate(request);
    if(!actorId)return json({error:'Authentication required'},401);
    const path=new URL(request.url).pathname;
    try{
      if(path==='/api/v2/runs'&&request.method==='POST'){
        const body:unknown=await request.json();
        if(!object(body)||!text(body.goal,4000)||!text(body.body,20000)||!Array.isArray(body.targetIds)||
          !body.targetIds.length||body.targetIds.length>100||!body.targetIds.every(id=>text(id,200)))
          return json({error:'Invalid start request'},400);
        const targetIds=body.targetIds;
        const targets=await host.resolveTargets(actorId,targetIds);
        if(targets.length!==new Set(targetIds).size||targets.some(t=>!targetIds.includes(t.entityId)))
          return json({error:'Targets are not authorized'},403);
        return json(await slice.start({actorId,goal:body.goal,body:body.body,targets}),201);
      }
      const match=path.match(/^\/api\/v2\/runs\/([^/]+)(\/decision)?$/);
      if(!match)return json({error:'Not found'},404);
      if(!match[2]&&request.method==='GET')return json(slice.get(match[1],actorId));
      if(match[2]&&request.method==='POST'){
        const body:unknown=await request.json();
        if(!object(body)||(body.decision!=='approve'&&body.decision!=='reject'))return json({error:'Invalid decision'},400);
        return json(await slice.decide(match[1],actorId,body.decision));
      }
      return json({error:'Method not allowed'},405);
    }catch(error){
      if(error instanceof Error&&error.message==='Run not found for actor')return json({error:'Not found'},404);
      return json({error:'Request could not be completed'},400);
    }
  };
}
