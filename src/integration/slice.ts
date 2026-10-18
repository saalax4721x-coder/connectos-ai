import {NexusRuntime, type NexusRunResult} from '../nexus/runtime';
import type {GoalIntent} from '../intent/schema';
import {RuntimeAgentRegistry} from '../agents/runtime-registry';
import {AgentExecutor, type AgentExecutionStore} from '../agents/execution';
import {WorkflowEngine, type WorkflowRunStore} from '../workflows/engine';
import type {WorkflowRun} from '../workflows/types';
import {qualifyOpportunity} from '../opportunities/qualification';
import {isExpired} from '../opportunities/engine';
import {collectIntelligence, nexusIntelligenceAdapter, type IntelligenceServices,
  type IntegratedIntelligence, type ResearchTarget} from './adapters';

export interface OutreachAction {
  tool:'send-message';
  recipientId:string;
  opportunityId:string;
  body:string;
  idempotencyKey:string;
}
export interface SliceRequest {actorId:string;goal:string;targets:ResearchTarget[];body:string;}
export interface SliceView {
  run:WorkflowRun;
  intelligence?:IntegratedIntelligence;
  nexus?:NexusRunResult;
  action?:OutreachAction;
}
export interface SliceServices extends IntelligenceServices {
  agents:RuntimeAgentRegistry;
  planningAgentId:string;
  actionAgentId:string;
  agentExecutions:AgentExecutionStore;
  workflowRuns:WorkflowRunStore;
}
interface Session {
  request:SliceRequest;
  intent:GoalIntent;
  runtime?:NexusRuntime;
  intelligence?:IntegratedIntelligence;
  nexus?:NexusRunResult;
  action?:OutreachAction;
  approved:boolean;
}

/** Application boundary. Call actorId must come from the authenticated host session. */
export class ConnectOSSlice {
  private readonly sessions=new Map<string,Session>();
  private readonly busy=new Set<string>();
  private readonly workflows:WorkflowEngine;
  private readonly executor:AgentExecutor;

  constructor(private readonly services:SliceServices){
    this.executor=new AgentExecutor(services.agents,services.agentExecutions,{maxAttempts:1});
    this.workflows=new WorkflowEngine(services.workflowRuns,{execute:async(step,run)=>{
      try{return {stepId:step.id,output:await this.executeStep(step.id,run)};}
      catch(error){return {stepId:step.id,error:error instanceof Error?error.message:String(error)};}
    }});
  }

  async start(request:SliceRequest):Promise<SliceView>{
    if(!request.actorId.trim()||!request.goal.trim()||!request.body.trim()||!request.targets.length)
      throw new Error('Actor, goal, research targets and outreach body are required');
    const id=`slice_${crypto.randomUUID()}`;
    const intent={...new NexusRuntime().plan(request.goal).intent,id:`${id}:intent`};
    this.sessions.set(id,{request:structuredClone(request),intent,approved:false});
    this.workflows.create({id:'connectos-v2-research-outreach',name:'Research to approved outreach',version:1,steps:[
      {id:'analyze',name:'Research, qualify and plan',kind:'sequential',dependsOn:[]},
      {id:'outreach',name:'Send the reviewed outreach',kind:'approval',dependsOn:['analyze'],requiresApproval:true},
      {id:'remember',name:'Record outcome in Memory',kind:'sequential',dependsOn:['outreach']},
    ]},intent.id,id);
    await this.exclusive(id,()=>this.workflows.run(id));
    return this.get(id,request.actorId);
  }

  get(id:string,actorId:string):SliceView{
    const session=this.owned(id,actorId);
    const run=this.workflows.get(id);
    if(!run)throw new Error('Workflow run not found');
    return structuredClone({run,intelligence:session.intelligence,nexus:session.nexus,action:session.action});
  }

  async decide(id:string,actorId:string,decision:'approve'|'reject'):Promise<SliceView>{
    if(decision!=='approve'&&decision!=='reject')throw new Error('Decision must be approve or reject');
    const session=this.owned(id,actorId);
    await this.exclusive(id,async()=>{
      const run=this.workflows.get(id);
      if(run?.state!=='waiting-approval'||!session.action)throw new Error('No outreach approval pending');
      if(decision==='reject'){this.workflows.cancel(id);return;}
      session.approved=true;
      this.workflows.resume(id,['outreach']);
      await this.workflows.run(id);
    });
    return this.get(id,actorId);
  }

  private owned(id:string,actorId:string):Session{
    const session=this.sessions.get(id);
    if(!session||session.request.actorId!==actorId)throw new Error('Run not found for actor');
    return session;
  }

  private async exclusive<T>(id:string,fn:()=>Promise<T>):Promise<T>{
    if(this.busy.has(id))throw new Error('Run is already executing');
    this.busy.add(id);
    try{return await fn();}finally{this.busy.delete(id);}
  }

  private async executeStep(stepId:string,run:WorkflowRun):Promise<unknown>{
    const session=this.sessions.get(run.id)!;
    const {request,intent}=session;
    if(stepId==='analyze'){
      const snapshot=await collectIntelligence(this.services,intent,request.actorId,request.targets);
      session.intelligence=snapshot;
      const chosen=snapshot.opportunities.find(r=>snapshot.warmPaths.some(p=>
        r.opportunity.people.includes(p.to)&&!p.requiresConsent&&p.confidence>0));
      if(!chosen)throw new Error('No qualified, source-backed opportunity with a consented access path');
      const recipientId=chosen.opportunity.people.find(id=>snapshot.warmPaths.some(p=>p.to===id&&!p.requiresConsent&&p.confidence>0))!;
      session.action={tool:'send-message',recipientId,opportunityId:chosen.opportunity.id,
        body:request.body,idempotencyKey:`${run.id}:outreach`};
      // Wrap the selected existing agent with its guarded executor, rather than a new engine.
      const planner=this.services.agents.resolve(this.services.planningAgentId);
      if(planner.tools.length)throw new Error('Planning agent must be read-only (no executable tools)');
      const registry=new RuntimeAgentRegistry().register({...planner,execute:async(ctx,input)=>{
        const record=await this.executor.execute(`${run.id}:${ctx.requestId}`,planner.id,ctx,input);
        if(record.status!=='completed')throw new Error(record.error??'Planning agent did not complete');
        return record.output;
      }});
      session.runtime=new NexusRuntime({runtimeAgents:registry,intelligence:nexusIntelligenceAdapter(snapshot)});
      session.nexus=await session.runtime.run(intent,request.actorId);
      if(session.nexus.results.some(s=>s.status==='FAILED'||s.status==='UNASSIGNED'))throw new Error('NEXUS planning failed');
      return {action:session.action,research:snapshot.research,ranked:session.nexus.rankedOpportunities};
    }
    if(stepId==='outreach'){
      if(!session.approved||!session.action||!session.runtime)throw new Error('Explicit outreach approval required');
      const action=session.action;
      const current=await this.services.opportunities.revalidate(action.opportunityId);
      const paths=await this.services.graph.findWarmPaths(request.actorId,action.recipientId);
      if(!current||isExpired(current)||!qualifyOpportunity(current).qualified||!paths.some(p=>!p.requiresConsent&&p.confidence>0))
        throw new Error('Opportunity or access changed; research and approval must be renewed');
      session.nexus=await session.runtime.run(intent,request.actorId,session.runtime.plan(intent).approvals.map(g=>({...g,status:'approved' as const})));
      if(session.nexus.results.some(s=>s.status!=='COMPLETED'))throw new Error('NEXUS execution did not complete');
      const record=await this.executor.execute(action.idempotencyKey,this.services.actionAgentId,{
        requestId:action.idempotencyKey,actorId:request.actorId,goalId:intent.id,workflowId:run.id,
        facts:{action:structuredClone(action)},constraints:intent.constraints,approvals:[action.tool],correlationId:run.id,
      },structuredClone(action),action.tool);
      if(record.status!=='completed')throw new Error(record.error??'Outreach did not complete');
      return record.output;
    }
    if(stepId!=='remember')throw new Error('Unknown integrated step');
    const now=new Date().toISOString();
    await this.services.memory.remember({id:`${run.id}:outcome`,scope:'workflow',subjectId:run.id,
      value:{actorId:request.actorId,action:session.action,outcome:session.runtime?.getOutcome(`nexus-execution-${intent.id}`)},
      createdAt:now,updatedAt:now,importance:.8,confidence:1,sensitivity:'private',tags:['connectos-v2','outcome'],status:'active'});
    return {recorded:true};
  }
}
