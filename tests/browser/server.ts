/** Test-only loopback host. Never mount these fixture routes in a deployed application. */
import {createServer} from 'node:http';
import {ConnectOSSlice} from '../../src/integration/slice';
import {createSliceHttpHandler} from '../../src/integration/http-api';
import {RuntimeAgentRegistry,type RuntimeAgent} from '../../src/agents/runtime-registry';
import {InMemoryAgentExecutionStore} from '../../src/agents/execution';
import {InMemoryWorkflowRunStore} from '../../src/workflows/engine';
import {createGraphService} from '../../src/graph/service';
import {createOpportunityEngineService} from '../../src/opportunities/service';
import {MemoryOpportunityStore} from '../../src/opportunities/store';
import {MemoryService} from '../../src/memory/service';
import {InMemoryMemoryStore} from '../../src/memory/store';
import type {ResearchTarget} from '../../src/integration/adapters';
import {createSessionAuthenticator,hashSessionToken} from '../../src/integration/session-auth';
import {createNodeApiListener} from '../../src/integration/node-http';
import {createApplicationHandler} from '../../src/integration/application-host';

const origin='http://127.0.0.1:4173';
const csrf='fixture-csrf'.repeat(4);
const sessions={origin,cookieName:'test-session',async lookupSession(hash:string){
  const actor=['owner','other'].find(id=>hashSessionToken(id.repeat(9))===hash);
  return actor?{actorId:actor,csrfToken:`${actor}_${csrf}`,expiresAt:new Date(Date.now()+3600000).toISOString()}:undefined;
}};
const contact:ResearchTarget={entityId:'partner-1',title:'Amina — East Africa Distribution',type:'distributor',
  signals:{relevance:1,fit:.9,timing:.9,access:.9,value:.8,urgency:.8,competition:.1,effort:.1,risk:.1,confidence:.95}};

async function fixture(){
  let sends=0;let starts=0;let decisions=0;
  const graph=createGraphService();const memory=new MemoryService(new InMemoryMemoryStore());
  const now=new Date().toISOString();
  for(const id of ['owner','partner-1'])await graph.addNode({id,displayName:id,companyIds:[],skillIds:[],verified:true,
    source:'browser-fixture',observedAt:now,confidence:1,provenance:[]});
  await graph.addRelationship({id:'access-1',from:'owner',to:'partner-1',type:'can-introduce',source:'browser-fixture',
    observedAt:now,confidence:1,strength:1,consent:'granted',provenance:[]});
  const base={name:'Browser fixture agent',version:'1',domain:'research',capabilities:['research'],permissions:['research'],
    skills:['research','validate','evaluate','select'],tools:[],memory:[],inputSchema:'unknown',outputSchema:'unknown',status:'active' as const};
  const planner:RuntimeAgent={...base,id:'planner',async execute(ctx){return {requestId:ctx.requestId};}};
  const sender:RuntimeAgent={...base,id:'sender',tools:['send-message'],async execute(_ctx,input){
    sends++;await new Promise(resolve=>setTimeout(resolve,100));return {receiptId:'fixture-receipt',action:input};}};
  const slice=new ConnectOSSlice({graph,memory,opportunities:createOpportunityEngineService(new MemoryOpportunityStore()),
    research:{async search(){return [{entityId:'partner-1',entityType:'person',score:1,reason:'fixture target',sourceIds:['partner-profile'],freshness:1}];},
      async evidence(){return [{id:'evidence-1',entityId:'partner-1',claim:'Partnership interest',value:'Seeking distribution partners',
        sourceIds:['partner-profile'],observedAt:now,confidence:.95,freshness:1}];}},
    agents:new RuntimeAgentRegistry().register(planner).register(sender),planningAgentId:'planner',actionAgentId:'sender',
    agentExecutions:new InMemoryAgentExecutionStore(),workflowRuns:new InMemoryWorkflowRunStore()});
  const handler=createSliceHttpHandler(slice,{
    authenticate:createSessionAuthenticator(sessions),
    async resolveTargets(actor,ids){return actor==='owner'&&ids.length===1&&ids[0]===contact.entityId?[contact]:[];},
    async listTargets(actor){return actor==='owner'?[contact]:[];},
  });
  return {handler,counts:()=>({sends,starts,decisions}),start:()=>{starts++;},decision:()=>{decisions++;},
    revoke:()=>graph.addRelationship({id:'access-1',from:'owner',to:'partner-1',type:'can-introduce',source:'browser-fixture',
      observedAt:now,confidence:1,strength:1,consent:'declined',provenance:[]})};
}
let current=await fixture();
const handler=await createApplicationHandler({...sessions,buildDirectory:'dist',apiHandler:request=>current.handler(request)});
const appListener=createNodeApiListener({publicOrigin:origin,handler});
const server=createServer({requestTimeout:15000,headersTimeout:10000},async(req,res)=>{
    try{
      const url=new URL(req.url??'/',origin);
      if(url.pathname==='/'){appListener(req,res);return;}
      if(url.pathname==='/__test/reset'&&req.method==='POST'){
        current=await fixture();res.setHeader('Content-Type','application/json');res.end('{}');return;
      }
      if(url.pathname==='/__test/counts'){
        res.setHeader('Content-Type','application/json');res.end(JSON.stringify(current.counts()));return;
      }
      if(url.pathname==='/__test/revoke-consent'&&req.method==='POST'){
        await current.revoke();res.setHeader('Content-Type','application/json');res.end('{}');return;
      }
      if(url.pathname==='/api/v2/runs'&&req.method==='POST')current.start();
      if(url.pathname.endsWith('/decision')&&req.method==='POST')current.decision();
      appListener(req,res);
    }catch{res.writeHead(500);res.end('Fixture unavailable');}
});
await new Promise<void>((resolve,reject)=>{server.once('error',reject);server.listen(4173,'127.0.0.1',resolve);});
console.log(`Browser fixture ready at ${origin}`);
