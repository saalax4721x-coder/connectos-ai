import type {WorkflowRun,WorkflowState} from './types';
const terminal=new Set<WorkflowState>(['succeeded','failed','cancelled']);
const transitions:Record<WorkflowState,WorkflowState[]>={pending:['running','cancelled'],running:['waiting-approval','succeeded','failed','cancelled'],'waiting-approval':['running','failed','cancelled'],succeeded:[],failed:[],cancelled:[]};
export function transition(run:WorkflowRun,next:WorkflowState):WorkflowRun{
  if(!transitions[run.state].includes(next))throw new Error(`invalid workflow transition: ${run.state} -> ${next}`);
  const now=new Date().toISOString();
  return {...run,state:next,...(next==='running'&&!run.startedAt?{startedAt:now}:{}),...(terminal.has(next)?{finishedAt:now}:{}),version:run.version+1};
}
export function readySteps(run:WorkflowRun){return run.steps.filter(s=>s.state==='pending'&&s.dependsOn.every(id=>run.steps.find(x=>x.id===id)?.state==='succeeded'));}
export function refreshState(run:WorkflowRun):WorkflowRun{
  if(run.state==='running'&&run.steps.length>0&&run.steps.every(s=>s.state==='succeeded'))return transition(run,'succeeded');
  if(run.state==='running'&&run.steps.some(s=>s.state==='failed'&&s.attempts>s.retryLimit))return transition(run,'failed');
  if(run.state==='running'&&run.steps.some(s=>s.state==='waiting-approval'))return transition(run,'waiting-approval');
  return run;
}