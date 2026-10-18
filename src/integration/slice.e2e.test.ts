import {describe,it,expect} from 'vitest';
import {ConnectOSSlice, type SliceRequest} from './slice';
import {RuntimeAgentRegistry, type RuntimeAgent} from '../agents/runtime-registry';
import {InMemoryAgentExecutionStore} from '../agents/execution';
import {InMemoryWorkflowRunStore} from '../workflows/engine';
import {MemoryService} from '../memory/service';
import {InMemoryMemoryStore} from '../memory/store';
import {createOpportunityEngineService} from '../opportunities/service';
import {MemoryOpportunityStore} from '../opportunities/store';
import {InMemoryGraph} from '../graph/repository';
import {createGraphService} from '../graph/service';
import type {ResearchEvidence,ResearchProvider} from '../research/schema';
import {createServer} from 'node:http';
import {createHttpResearchProvider} from './http-research';
import {createSliceHttpHandler} from './http-api';

async function fixture(options:{provider?:ResearchProvider;conflict?:boolean;stale?:boolean;consent?:'granted'|'declined';tool?:boolean;sendFails?:boolean;plannerFails?:boolean}={}){
  const now=new Date().toISOString();
  let searches=0,plans=0,sends=0;
  const evidence:ResearchEvidence={id:'e1',entityId:'person-1',claim:'need',value:'distribution partner',
    sourceIds:['source-1'],observedAt:now,confidence:.95,freshness:options.stale?.1:1};
  const research:ResearchProvider={async search(){searches++;return [{entityId:'person-1',entityType:'person',score:1,
    reason:'explicit target',sourceIds:['source-1'],freshness:1}];},
    async evidence(){return options.conflict?[evidence,{...evidence,id:'e2',value:'not seeking partners'}]:[evidence];}};
  const graphStore=new InMemoryGraph();
  const graph=createGraphService(graphStore);
  for(const id of ['owner','person-1'])await graph.addNode({id,displayName:id,companyIds:[],skillIds:[],verified:true,
    source:'test',observedAt:now,confidence:1,provenance:[]});
  const edge={id:'edge-1',from:'owner',to:'person-1',type:'can-introduce' as const,source:'test',confidence:1,
    observedAt:now,provenance:[],strength:1,consent:options.consent??'granted' as const};
  await graph.addRelationship(edge);
  const memory=new MemoryService(new InMemoryMemoryStore());
  await memory.remember({id:'preference',scope:'user',subjectId:'owner',value:'Prefer local distribution partners',createdAt:now,
    updatedAt:now,importance:1,confidence:1,sensitivity:'private',tags:['preference'],status:'active'});
  const opportunities=createOpportunityEngineService(new MemoryOpportunityStore());
  const base={version:'1',name:'Agent',domain:'research',capabilities:['research'],permissions:['research'],
    skills:['research','validate','evaluate','select'],tools:[],memory:['goal'],inputSchema:'unknown',outputSchema:'unknown',status:'active' as const};
  const planner:RuntimeAgent={...base,id:'planner',async execute(ctx){plans++;if(options.plannerFails)throw new Error('Planner unavailable');
    return {requestId:ctx.requestId,intelligence:ctx.facts.intelligence};}};
  const sender:RuntimeAgent={...base,id:'sender',tools:options.tool===false?[]:['send-message'],async execute(_ctx,input){
    sends++;if(options.sendFails)throw new Error('Delivery uncertain');return {receiptId:'receipt-1',action:input};}};
  const agents=new RuntimeAgentRegistry().register(planner).register(sender);
  const slice=new ConnectOSSlice({research:options.provider??research,graph,opportunities,memory,agents,planningAgentId:'planner',actionAgentId:'sender',
    agentExecutions:new InMemoryAgentExecutionStore(),workflowRuns:new InMemoryWorkflowRunStore()});
  const request:SliceRequest={actorId:'owner',goal:'Find a distribution partner in Kenya',body:'May we discuss a partnership?',
    targets:[{entityId:'person-1',title:'Distribution partner',type:'distributor',signals:{relevance:1,fit:.9,timing:.9,
      access:.9,value:.8,urgency:.8,competition:.1,effort:.1,risk:.1,confidence:.95}}]};
  return {slice,request,memory,graph,edge,opportunities,counts:()=>({searches,plans,sends})};
}

describe('ConnectOS V2 integrated application end-to-end',()=>{
  it('exposes authenticated start, review and approval using host-resolved targets',async()=>{
    const f=await fixture();
    const handler=createSliceHttpHandler(f.slice,{authenticate:async req=>req.headers.get('test-actor')??undefined,
      resolveTargets:async()=>f.request.targets,listTargets:async()=>f.request.targets});
    const call=(path:string,method:string,body?:unknown,actor='owner')=>handler(new Request(`https://connectos.example/api/v2/runs${path}`,
      {method,headers:{'test-actor':actor,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined}));
    expect((await call('','POST',{},'')).status).toBe(401);
    const targets=await handler(new Request('https://connectos.example/api/v2/targets',{headers:{'test-actor':'owner'}}));
    expect(await targets.json()).toEqual([{id:'person-1',title:'Distribution partner',type:'distributor'}]);
    const start=await call('','POST',{goal:f.request.goal,body:f.request.body,targetIds:['person-1'],actorId:'spoofed'});
    expect(start.status).toBe(201);
    const pending=await start.json();
    expect((await call(`/${pending.run.id}`,'GET',undefined,'other-user')).status).toBe(404);
    expect((await call(`/${pending.run.id}/decision`,'POST',{decision:'maybe'})).status).toBe(400);
    expect(f.counts().sends).toBe(0);
    const approved=await call(`/${pending.run.id}/decision`,'POST',{decision:'approve'});
    expect(approved.status).toBe(200);expect((await approved.json()).run.state).toBe('succeeded');
    expect(f.counts().sends).toBe(1);
  });

  it('crosses the real HTTP adapter boundary before approved delivery',async()=>{
    const requests:string[]=[];
    const server=createServer((req,res)=>{
      requests.push(req.url!);res.setHeader('Content-Type','application/json');
      res.end(JSON.stringify(req.url==='/search'?[{entityId:'person-1',entityType:'person',score:1,reason:'match',sourceIds:['s1'],freshness:1}]:
        [{id:'e1',entityId:'person-1',claim:'need',value:'distribution',sourceIds:['s1'],observedAt:new Date().toISOString(),confidence:1,freshness:1}]));
    });
    await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
    try{
      const address=server.address();if(!address||typeof address==='string')throw new Error('Missing HTTP test port');
      const f=await fixture({provider:createHttpResearchProvider({baseUrl:`http://127.0.0.1:${address.port}`})});
      const pending=await f.slice.start(f.request);
      expect(pending.run.state,pending.run.steps.find(s=>s.error)?.error).toBe('waiting-approval');
      expect(requests).toEqual(['/search','/evidence']);
      expect((await f.slice.decide(pending.run.id,'owner','approve')).run.state).toBe('succeeded');
      expect(f.counts().sends).toBe(1);
    }finally{await new Promise<void>((resolve,reject)=>{server.close(e=>e?reject(e):resolve());server.closeAllConnections();});}
  });

  it('runs real engines from research through approval, delivery and Memory',async()=>{
    const f=await fixture();
    const pending=await f.slice.start(f.request);
    expect(pending.run.state).toBe('waiting-approval');
    expect(f.counts().sends).toBe(0);
    expect(pending.intelligence?.research.findings[0].sourceIds).toEqual(['source-1']);
    expect(pending.intelligence?.opportunities[0].qualification.qualified).toBe(true);
    expect(pending.intelligence?.warmPaths[0].to).toBe('person-1');
    expect(pending.intelligence?.memories[0].id).toBe('preference');
    expect(pending.nexus?.results.some(r=>r.status==='COMPLETED')).toBe(true);
    const safePlans=f.counts().plans;
    const completed=await f.slice.decide(pending.run.id,'owner','approve');
    expect(completed.run.state).toBe('succeeded');
    expect(f.counts()).toEqual({searches:1,plans:safePlans+1,sends:1});
    const memories=await f.memory.retrieve({scope:'workflow',subjectId:pending.run.id});
    expect(memories).toHaveLength(1);
    expect(memories[0].value).toMatchObject({actorId:'owner',outcome:{status:'SUCCEEDED'}});
    await expect(f.slice.decide(pending.run.id,'owner','approve')).rejects.toThrow('No outreach approval pending');
    expect(f.counts().sends).toBe(1);
  });

  it('binds viewing and approval to the authenticated actor',async()=>{
    const f=await fixture();const pending=await f.slice.start(f.request);
    expect(()=>f.slice.get(pending.run.id,'other-user')).toThrow('Run not found for actor');
    await expect(f.slice.decide(pending.run.id,'other-user','approve')).rejects.toThrow('Run not found for actor');
    expect(f.counts().sends).toBe(0);
  });

  it('does not feed forgotten memories into NEXUS',async()=>{
    const f=await fixture();await f.memory.forget('preference');
    const pending=await f.slice.start(f.request);
    expect(pending.intelligence?.memories).toHaveLength(0);
  });

  it('does not let review data mutate the approved recipient or body',async()=>{
    const f=await fixture();const pending=await f.slice.start(f.request);
    pending.action!.body='changed';pending.action!.recipientId='intruder';
    f.request.body='changed later';
    const done=await f.slice.decide(pending.run.id,'owner','approve');
    expect(done.action?.body).toBe('May we discuss a partnership?');
    expect(done.action?.recipientId).toBe('person-1');
  });

  it('cancels rejected outreach without delivery or success memory',async()=>{
    const f=await fixture();const pending=await f.slice.start(f.request);
    const rejected=await f.slice.decide(pending.run.id,'owner','reject');
    expect(rejected.run.state).toBe('cancelled');expect(f.counts().sends).toBe(0);
    expect(await f.memory.retrieve({scope:'workflow',subjectId:pending.run.id})).toHaveLength(0);
  });

  it.each([{conflict:true},{stale:true},{consent:'declined' as const}])('blocks unsafe research/access: %j',async options=>{
    const f=await fixture(options);const blocked=await f.slice.start(f.request);
    expect(blocked.run.state).toBe('failed');expect(f.counts().sends).toBe(0);
    await expect(f.slice.decide(blocked.run.id,'owner','approve')).rejects.toThrow();
  });

  it('rechecks graph consent immediately before the approved action',async()=>{
    const f=await fixture();const pending=await f.slice.start(f.request);
    await f.graph.addRelationship({...f.edge,consent:'declined'});
    const blocked=await f.slice.decide(pending.run.id,'owner','approve');
    expect(blocked.run.state).toBe('failed');expect(f.counts().sends).toBe(0);
  });

  it('rechecks evidence expiry before delivery',async()=>{
    const f=await fixture();const pending=await f.slice.start(f.request);
    const record=await f.opportunities.revalidate(pending.action!.opportunityId);
    // A repository update can expire a previously approved candidate.
    f.opportunities.revalidate=async()=>({...record!,expiresAt:'2000-01-01T00:00:00.000Z'});
    const blocked=await f.slice.decide(pending.run.id,'owner','approve');
    expect(blocked.run.state).toBe('failed');expect(f.counts().sends).toBe(0);
  });

  it('enforces declared agent tools even after user approval',async()=>{
    const f=await fixture({tool:false});const pending=await f.slice.start(f.request);
    const blocked=await f.slice.decide(pending.run.id,'owner','approve');
    expect(blocked.run.state).toBe('failed');expect(f.counts().sends).toBe(0);
  });

  it('does not automatically retry uncertain external delivery',async()=>{
    const f=await fixture({sendFails:true});const pending=await f.slice.start(f.request);
    const failed=await f.slice.decide(pending.run.id,'owner','approve');
    expect(failed.run.state).toBe('failed');expect(f.counts().sends).toBe(1);
    expect(await f.memory.retrieve({scope:'workflow',subjectId:pending.run.id})).toHaveLength(0);
  });

  it('stops planning failure before external approval',async()=>{
    const f=await fixture({plannerFails:true});const failed=await f.slice.start(f.request);
    expect(failed.run.state).toBe('failed');expect(f.counts().sends).toBe(0);
  });

  it('rejects concurrent approvals without duplicate delivery',async()=>{
    const f=await fixture();const pending=await f.slice.start(f.request);
    const outcomes=await Promise.allSettled([f.slice.decide(pending.run.id,'owner','approve'),f.slice.decide(pending.run.id,'owner','approve')]);
    expect(outcomes.filter(o=>o.status==='fulfilled')).toHaveLength(1);
    expect(f.counts().sends).toBe(1);
  });
});
