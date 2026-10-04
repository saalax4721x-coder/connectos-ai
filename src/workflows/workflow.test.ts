import {describe,expect,it} from 'vitest';
import {WorkflowEngine,InMemoryWorkflowRunStore} from './engine';
import {instantiateRun,validateWorkflow} from './workflow';
import {readySteps} from './state-machine';
const workflow={id:'wf',name:'Opportunity execution',version:1,steps:[
{id:'research',name:'Research',kind:'sequential' as const,dependsOn:[],retryLimit:1},
{id:'outreach',name:'Outreach',kind:'sequential' as const,dependsOn:['research'],requiresApproval:true},
]};
const executor={execute:async(step:any)=>({stepId:step.id,output:{ok:true}})};
describe('Workflow Engine',()=>{
it('rejects missing dependencies and cycles',()=>{expect(()=>validateWorkflow({...workflow,steps:[{...workflow.steps[0],dependsOn:['missing']}]})).toThrow();expect(()=>validateWorkflow({...workflow,steps:[{...workflow.steps[0],dependsOn:['outreach']},workflow.steps[1]]})).toThrow();});
it('instantiates runs and exposes dependency-ready work',()=>{const run=instantiateRun(workflow,'goal-1','run-1');expect(readySteps(run).map(s=>s.id)).toEqual(['research']);});
it('executes dependencies then stops at approval',async()=>{const store=new InMemoryWorkflowRunStore();const engine=new WorkflowEngine(store,executor);engine.create(workflow,'goal-1','run-1');const waiting=await engine.run('run-1');expect(waiting.state).toBe('waiting-approval');expect(waiting.steps.find(s=>s.id==='research')?.state).toBe('succeeded');expect(waiting.steps.find(s=>s.id==='outreach')?.state).toBe('waiting-approval');});
it('resumes only after approval',async()=>{const store=new InMemoryWorkflowRunStore();const engine=new WorkflowEngine(store,executor);engine.create(workflow,'goal-1','run-2');await engine.run('run-2');expect(engine.resume('run-2',[]).state).toBe('waiting-approval');expect(engine.resume('run-2',['outreach']).state).toBe('running');});
it('retries failed steps within their limit',async()=>{let attempts=0;const store=new InMemoryWorkflowRunStore();const flaky={execute:async(step:any)=>{attempts++;return attempts===1?{stepId:step.id,error:'temporary'}:{stepId:step.id,output:'ok'}}};const wf={id:'retry',name:'Retry',version:1,steps:[{id:'a',name:'A',kind:'sequential' as const,dependsOn:[],retryLimit:1}]};const engine=new WorkflowEngine(store,flaky);engine.create(wf,'g','r');const done=await engine.run('r');expect(attempts).toBe(2);expect(done.state).toBe('succeeded');});
it('cancels terminal runs',()=>{const store=new InMemoryWorkflowRunStore();const engine=new WorkflowEngine(store,executor);engine.create({...workflow,steps:[workflow.steps[0]]},'g','r');expect(engine.cancel('r').state).toBe('cancelled');expect(()=>engine.cancel('r')).toThrow();});
});