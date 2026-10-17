/** Test-only loopback host. Never mount these fixture routes in a deployed application. */
import {preview} from 'vite';
import {readFile} from 'node:fs/promises';
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

const origin='http://127.0.0.1:4173';
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
    async authenticate(req){
      const actor=req.headers.get('cookie')?.match(/(?:^|;\s*)test-session=(owner|other)(?:;|$)/)?.[1];
      if(req.method==='POST'&&req.headers.get('x-csrf-token')!=='fixture-csrf')return undefined;
      return actor;
    },
    async resolveTargets(actor,ids){return actor==='owner'&&ids.length===1&&ids[0]===contact.entityId?[contact]:[];},
    async listTargets(actor){return actor==='owner'?[contact]:[];},
  });
  return {handler,counts:()=>({sends,starts,decisions}),start:()=>{starts++;},decision:()=>{decisions++;},
    revoke:()=>graph.addRelationship({id:'access-1',from:'owner',to:'partner-1',type:'can-introduce',source:'browser-fixture',
      observedAt:now,confidence:1,strength:1,consent:'declined',provenance:[]})};
}
let current=await fixture();
const html=(await readFile('dist/index.html','utf8')).replace('</head>','<meta name="csrf-token" content="fixture-csrf"></head>');

await preview({configFile:false,root:process.cwd(),preview:{host:'127.0.0.1',port:4173,strictPort:true},plugins:[{
  name:'authenticated-browser-test-host',
  configurePreviewServer(server){
    server.middlewares.use(async(req,res,next)=>{
      const url=new URL(req.url??'/',origin);
      if(url.pathname==='/'&&req.method==='GET'){
        res.setHeader('Content-Type','text/html');res.end(html);return;
      }
      if(url.pathname==='/__test/reset'&&req.method==='POST'){
        current=await fixture();res.setHeader('Content-Type','application/json');res.end('{}');return;
      }
      if(url.pathname==='/__test/counts'){
        res.setHeader('Content-Type','application/json');res.end(JSON.stringify(current.counts()));return;
      }
      if(url.pathname==='/__test/revoke-consent'&&req.method==='POST'){
        await current.revoke();res.setHeader('Content-Type','application/json');res.end('{}');return;
      }
      if(!url.pathname.startsWith('/api/'))return next();
      try{
        const chunks:Buffer[]=[];for await(const chunk of req)chunks.push(Buffer.from(chunk));
        const headers=new Headers();for(const [key,value] of Object.entries(req.headers))if(value)headers.set(key,Array.isArray(value)?value.join(','):value);
        if(url.pathname==='/api/v2/runs'&&req.method==='POST')current.start();
        if(url.pathname.endsWith('/decision')&&req.method==='POST')current.decision();
        const response=await current.handler(new Request(url,{method:req.method,headers,
          body:chunks.length?Buffer.concat(chunks).toString():undefined}));
        res.statusCode=response.status;response.headers.forEach((value,key)=>res.setHeader(key,value));
        res.end(await response.text());
      }catch{res.statusCode=500;res.end('Browser fixture failure');}
    });
  },
}]});
console.log(`Browser fixture ready at ${origin}`);
