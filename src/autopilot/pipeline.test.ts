import {describe,expect,it} from 'vitest';
import {createGoal} from './goal';
import {AutopilotEngine,InMemoryAutopilotStore,buildPipeline} from './pipeline';

const executor={async execute(step:{id:string},_goal:unknown,_run:unknown){return {step:step.id,ok:true};}};

describe('autopilot pipeline',()=>{
 it('builds the canonical seven stages',()=>{
  const goal=createGoal({id:'g1',userId:'u1',statement:'Find qualified leads',targetOutcome:'Book meetings'});
  expect(buildPipeline(goal).map(s=>s.stage)).toEqual(['clarify','research','evaluate','plan','execute','follow-up','review']);
 });
 it('requires explicit goal approval before a run',async()=>{
  const store=new InMemoryAutopilotStore(); const engine=new AutopilotEngine(store,executor);
  await engine.createGoal(createGoal({id:'g1',userId:'u1',statement:'x',targetOutcome:'y'}));
  await expect(engine.createRun('g1')).rejects.toThrow('goal requires approval');
  const approved=await engine.approveGoal('g1');
  expect(approved.approved).toBe(true); expect(approved.status).toBe('ready');
 });
 it('pauses for external approval and resumes to completion',async()=>{
  const store=new InMemoryAutopilotStore(); const engine=new AutopilotEngine(store,executor);
  await engine.createGoal(createGoal({id:'g1',userId:'u1',statement:'x',targetOutcome:'y'}));
  await engine.approveGoal('g1'); await engine.createRun('g1','r1');
  const waiting=await engine.run('r1');
  expect(waiting.status).toBe('waiting-approval'); expect(waiting.currentStepId).toBe('g1:execute');
  const resumed=await engine.approveCurrentStep('r1');
  expect(resumed.status).toBe('running');
  const done=await engine.run('r1');
  expect(done.status).toBe('completed'); expect(done.steps.every(s=>s.completed)).toBe(true);
 });
 it('supports cancellation from a running or paused state',async()=>{
  const store=new InMemoryAutopilotStore(); const engine=new AutopilotEngine(store,executor);
  await engine.createGoal(createGoal({id:'g1',userId:'u1',statement:'x',targetOutcome:'y'}));
  await engine.approveGoal('g1'); await engine.createRun('g1','r1'); await engine.run('r1');
  const cancelled=await engine.cancel('r1');
  expect(cancelled.status).toBe('cancelled');
 });
});