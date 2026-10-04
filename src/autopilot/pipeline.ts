import type {AutopilotGoal,AutopilotStatus} from './goal';

export type AutopilotStage='clarify'|'research'|'evaluate'|'plan'|'execute'|'follow-up'|'review';
export interface AutopilotStep{id:string;stage:AutopilotStage;title:string;description:string;requiresApproval:boolean;permission?:string;completed:boolean;output?:unknown;error?:string;}
export interface AutopilotRun{id:string;goalId:string;status:AutopilotStatus;steps:AutopilotStep[];currentStepId?:string;version:number;startedAt?:string;finishedAt?:string;updatedAt:string;}
export interface AutopilotGuardrails{maxSteps:number;requireApprovalForExternalActions:boolean;allowFinancialCommitments:boolean;allowPrivateDataSharing:boolean;}
export interface AutopilotExecutor{execute(step:AutopilotStep,goal:AutopilotGoal,run:AutopilotRun):Promise<unknown>;}
export interface AutopilotStore{getGoal(id:string):Promise<AutopilotGoal|undefined>;saveGoal(goal:AutopilotGoal):Promise<void>;getRun(id:string):Promise<AutopilotRun|undefined>;saveRun(run:AutopilotRun):Promise<void>;}

export const DEFAULT_GUARDRAILS:AutopilotGuardrails={maxSteps:20,requireApprovalForExternalActions:true,allowFinancialCommitments:false,allowPrivateDataSharing:false};
export const DEFAULT_STAGES:AutopilotStage[]=['clarify','research','evaluate','plan','execute','follow-up','review'];

export const buildPipeline=(goal:AutopilotGoal):AutopilotStep[]=>[
{id:`${goal.id}:clarify`,stage:'clarify',title:'Clarify goal constraints',description:goal.statement,requiresApproval:false,completed:false},
{id:`${goal.id}:research`,stage:'research',title:'Research relevant context',description:'Gather current people, companies, opportunities and signals.',requiresApproval:false,completed:false},
{id:`${goal.id}:evaluate`,stage:'evaluate',title:'Evaluate highest-value paths',description:'Rank options against the target outcome and constraints.',requiresApproval:false,completed:false},
{id:`${goal.id}:plan`,stage:'plan',title:'Create execution plan',description:'Select the smallest useful sequence of actions.',requiresApproval:false,completed:false},
{id:`${goal.id}:execute`,stage:'execute',title:'Execute approved actions',description:'Run selected actions through canonical agents and workflow controls.',requiresApproval:true,permission:'send-message',completed:false},
{id:`${goal.id}:follow-up`,stage:'follow-up',title:'Schedule follow-up',description:'Create the next accountable action.',requiresApproval:false,completed:false},
{id:`${goal.id}:review`,stage:'review',title:'Review outcome',description:'Record outcome, confidence and next action.',requiresApproval:false,completed:false}
];

export const validateGuardrails=(g:AutopilotGuardrails)=>{
 if(!Number.isInteger(g.maxSteps)||g.maxSteps<1)throw new Error('maxSteps must be positive');
 return g;
};

export const stepBlocked=(step:AutopilotStep,g=DEFAULT_GUARDRAILS)=>{
 if(step.permission==='financial-commitment'&&!g.allowFinancialCommitments)return 'financial-commitment-blocked';
 if(step.permission==='share-private-data'&&!g.allowPrivateDataSharing)return 'private-data-sharing-blocked';
 if(g.requireApprovalForExternalActions&&step.requiresApproval)return 'approval-required';
 return undefined;
};

export class InMemoryAutopilotStore implements AutopilotStore{
 private goals=new Map<string,AutopilotGoal>(); private runs=new Map<string,AutopilotRun>();
 async getGoal(id:string){const x=this.goals.get(id);return x&&{...x};}
 async saveGoal(goal:AutopilotGoal){this.goals.set(goal.id,{...goal});}
 async getRun(id:string){const x=this.runs.get(id);return x&&{...x,steps:x.steps.map(s=>({...s}))};}
 async saveRun(run:AutopilotRun){this.runs.set(run.id,{...run,steps:run.steps.map(s=>({...s}))});}
}

const allowed:Record<AutopilotStatus,AutopilotStatus[]>={
draft:['ready','cancelled'],ready:['running','cancelled'],running:['waiting-approval','paused','completed','failed','cancelled'],
'waiting-approval':['running','cancelled'],paused:['running','cancelled'],completed:[],failed:[],cancelled:[]
};
const transition=(from:AutopilotStatus,to:AutopilotStatus)=>{if(!allowed[from].includes(to))throw new Error(`invalid autopilot transition: ${from} -> ${to}`);return to;};

export class AutopilotEngine{
 constructor(private readonly store:AutopilotStore,private readonly executor:AutopilotExecutor,private readonly guardrails:AutopilotGuardrails=DEFAULT_GUARDRAILS){validateGuardrails(guardrails);}
 async createGoal(goal:AutopilotGoal){await this.store.saveGoal(goal);return goal;}
 async approveGoal(goalId:string){
  const goal=await this.store.getGoal(goalId);if(!goal)throw new Error('autopilot goal not found');
  if(goal.status!=='draft'&&goal.status!=='ready')throw new Error('goal cannot be approved');
  const next={...goal,approved:true,status:'ready' as const,updatedAt:new Date().toISOString()};await this.store.saveGoal(next);return next;
 }
 async createRun(goalId:string,runId=`${goalId}:run`){
  const goal=await this.store.getGoal(goalId);if(!goal)throw new Error('autopilot goal not found');
  if(!goal.approved)throw new Error('goal requires approval');
  const steps=buildPipeline(goal);if(steps.length>this.guardrails.maxSteps)throw new Error('autopilot plan exceeds maxSteps');
  const run:AutopilotRun={id:runId,goalId,status:'ready',steps,version:1,updatedAt:new Date().toISOString()};await this.store.saveRun(run);return run;
 }
 async run(runId:string){
  let run=await this.store.getRun(runId);if(!run)throw new Error('autopilot run not found');
  const goal=await this.store.getGoal(run.goalId);if(!goal)throw new Error('autopilot goal not found');
  if(run.status==='ready')run={...run,status:transition(run.status,'running'),startedAt:new Date().toISOString(),version:run.version+1};
  if(run.status==='waiting-approval')throw new Error('autopilot is waiting for approval');
  if(run.status!=='running'){await this.store.saveRun(run);return run;}
  for(const original of run.steps){
   if(original.completed)continue;
   const step={...original};const blocked=stepBlocked(step,this.guardrails);
   if(blocked){step.error=blocked;run={...run,status:'waiting-approval',currentStepId:step.id,steps:run.steps.map(s=>s.id===step.id?step:s),version:run.version+1,updatedAt:new Date().toISOString()};await this.store.saveRun(run);return run;}
   run={...run,currentStepId:step.id,updatedAt:new Date().toISOString(),version:run.version+1};await this.store.saveRun(run);
   try{step.output=await this.executor.execute(step,goal,run);step.completed=true;step.error=undefined;}
   catch(e){step.error=e instanceof Error?e.message:String(e);run={...run,status:'failed',steps:run.steps.map(s=>s.id===step.id?step:s),updatedAt:new Date().toISOString(),version:run.version+1};await this.store.saveRun(run);return run;}
   run={...run,steps:run.steps.map(s=>s.id===step.id?step:s),updatedAt:new Date().toISOString(),version:run.version+1};
  }
  run={...run,status:transition(run.status,'completed'),currentStepId:undefined,finishedAt:new Date().toISOString(),updatedAt:new Date().toISOString(),version:run.version+1};await this.store.saveRun(run);return run;
 }
 async approveCurrentStep(runId:string){
  let run=await this.store.getRun(runId);if(!run)throw new Error('autopilot run not found');
  if(run.status!=='waiting-approval')throw new Error('run is not waiting for approval');
  const id=run.currentStepId;if(!id)throw new Error('no approval step pending');
  const step=run.steps.find(s=>s.id===id);if(!step)throw new Error('approval step not found');
  step.requiresApproval=false;step.error=undefined;
  run={...run,status:transition(run.status,'running'),steps:run.steps.map(s=>s.id===id?step:s),version:run.version+1,updatedAt:new Date().toISOString()};await this.store.saveRun(run);return run;
 }
 async pause(runId:string){const run=await this.store.getRun(runId);if(!run)throw new Error('autopilot run not found');const next={...run,status:transition(run.status,'paused'),version:run.version+1,updatedAt:new Date().toISOString()};await this.store.saveRun(next);return next;}
 async cancel(runId:string){const run=await this.store.getRun(runId);if(!run)throw new Error('autopilot run not found');const next={...run,status:transition(run.status,'cancelled'),version:run.version+1,updatedAt:new Date().toISOString()};await this.store.saveRun(next);return next;}
}
