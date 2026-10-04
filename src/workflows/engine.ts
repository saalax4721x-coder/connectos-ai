import type {Workflow,WorkflowStepDefinition} from './workflow';
import type {WorkflowRun,WorkflowExecutionResult} from './types';
import {instantiateRun} from './workflow';
import {readySteps,refreshState,transition} from './state-machine';
export interface WorkflowStepExecutor{execute(step:WorkflowStepDefinition,run:WorkflowRun):Promise<WorkflowExecutionResult>;}
export interface WorkflowRunStore{get(id:string):WorkflowRun|undefined;save(run:WorkflowRun):void;}
export class InMemoryWorkflowRunStore implements WorkflowRunStore{
  private runs=new Map<string,WorkflowRun>();
  get(id:string){return this.runs.get(id);}
  save(run:WorkflowRun){this.runs.set(run.id,Object.freeze({...run,steps:run.steps.map(s=>Object.freeze({...s}))}));}
}
export class WorkflowEngine{
  constructor(private readonly store:WorkflowRunStore,private readonly executor:WorkflowStepExecutor){}
  create(workflow:Workflow,goalId:string,runId?:string){const run=instantiateRun(workflow,goalId,runId);this.store.save(run);return run;}
  get(runId:string){return this.store.get(runId);}
  async run(runId:string):Promise<WorkflowRun>{
    let run=this.store.get(runId);if(!run)throw new Error('workflow run not found: '+runId);
    if(run.state==='pending')run=transition(run,'running');
    if(run.state==='waiting-approval')throw new Error('workflow is waiting for approval');
    if(run.state!=='running'){this.store.save(run);return run;}
    this.store.save(run);
    while(true){
      const ready=readySteps(run);
      if(!ready.length){run=refreshState(run);this.store.save(run);return run;}
      for(const current of ready){
        const def:WorkflowStepDefinition={id:current.id,name:current.name,kind:'sequential',dependsOn:current.dependsOn,agentId:current.agentId,requiresApproval:current.requiresApproval,retryLimit:current.retryLimit};
        if(current.requiresApproval){current.state='waiting-approval';run={...run,steps:run.steps.map(s=>s.id===current.id?{...current}:s),version:run.version+1};run=refreshState(run);this.store.save(run);return run;}
        let result:WorkflowExecutionResult|undefined;
        while(current.attempts<=current.retryLimit){
          current.attempts+=1;result=await this.executor.execute(def,run);
          if(!result.error)break;
          current.error=result.error;
        }
        if(result?.waitingApproval)current.state='waiting-approval';
        else if(result?.error)current.state='failed';
        else {current.state='succeeded';current.output=result?.output;}
        run={...run,steps:run.steps.map(s=>s.id===current.id?{...current}:s),version:run.version+1};this.store.save(run);
        if(current.state==='waiting-approval')return refreshState(run);
        if(current.state==='failed')return refreshState(run);
      }
    }
  }
  resume(runId:string,approvedStepIds:string[]=[]){
    let run=this.store.get(runId);if(!run)throw new Error('workflow run not found: '+runId);
    if(run.state!=='waiting-approval')return run;
    const approved=new Set(approvedStepIds);
    if(run.steps.some(s=>s.state==='waiting-approval'&&!approved.has(s.id)))return run;
    run={...run,steps:run.steps.map(s=>approved.has(s.id)&&s.state==='waiting-approval'?{...s,state:'pending'}:s),version:run.version+1};
    run=transition(run,'running');this.store.save(run);return run;
  }
  cancel(runId:string){let run=this.store.get(runId);if(!run)throw new Error('workflow run not found: '+runId);run=transition(run,'cancelled');this.store.save(run);return run;}
}