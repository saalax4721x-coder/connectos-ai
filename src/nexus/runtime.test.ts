import {describe, expect, it} from 'vitest';
import {parseGoalIntent} from '../intent/parser';
import {RuntimeAgentRegistry, type RuntimeAgent} from '../agents/runtime-registry';
import type {Opportunity} from '../opportunities/types';
import {NexusRuntime} from './runtime';

const fixedNow = () => 1720000000000;

const researchAgent = (failures = 0, seen?: (input:unknown)=>void): RuntimeAgent => ({
  id:'research-agent', version:'1.0.0', name:'Research Agent', domain:'research', capabilities:['research'], permissions:['research'],
  skills:['research','validate','evaluate','select'], tools:[], memory:['goal'], inputSchema:'unknown', outputSchema:'unknown', status:'active',
  async execute(_ctx, input){
    seen?.(input);
    if (failures > 0) { failures -= 1; throw new Error('transient failure'); }
    return {ok:true,input};
  },
});

const opportunity: Opportunity = {
  id:'opp-1', type:'client', title:'Kenya distributor', description:'Distributor opportunity', people:['person-1'], companies:['company-1'], location:'Kenya', industry:'perfume', urgency:0.9,
  timestamp:new Date(fixedNow()).toISOString(), confidence:0.95, whyYou:['distribution fit'], whyThem:['market access'], whyNow:['expansion'], nextAction:'MESSAGE', provenance:[],
};

describe('NEXUS runtime', () => {
  it('extracts structured intent without inventing missing values', () => {
    const intent = parseGoalIntent('Find three distributors in Kenya for my perfume brand', fixedNow());
    expect(intent.location).toBe('Kenya');
    expect(intent.peopleRequired).toContain('distributor');
    expect(intent.budget).toBeUndefined();
  });

  it('parses budget multipliers and relative timelines', () => {
    const intent = parseGoalIntent('Find investors in Kenya with a budget of $2m within 30 days', fixedNow());
    expect(intent.budget).toBe(2_000_000);
    expect(intent.currency).toBe('USD');
    expect(intent.timeline).toBe('30 days');
  });

  it('creates a dependency-ordered plan with guarded outreach', () => {
    const runtime = new NexusRuntime({now: fixedNow});
    const result = runtime.plan('Find three serious distributors in Kenya for my perfume brand');
    expect(result.plan.steps.length).toBeGreaterThan(3);
    expect(result.plan.steps[1].dependsOn).toEqual([result.plan.steps[0].id]);
    expect(result.approvals.length).toBeGreaterThan(0);
  });

  it('blocks execution when a required goal is missing', () => {
    const runtime = new NexusRuntime({now: fixedNow});
    const result = runtime.execute('');
    expect(result.status).toBe('NEEDS_CLARIFICATION');
    expect(result.plan.unresolved).toContain('goal');
  });

  it('never treats pending approval as approved', () => {
    const runtime = new NexusRuntime({now: fixedNow});
    const result = runtime.execute('Find a client and prepare outreach');
    expect(result.status).toBe('WAITING_APPROVAL');
  });

  it('executes registered agents only after consequential approval', async () => {
    const registry = new RuntimeAgentRegistry().register(researchAgent());
    const runtime = new NexusRuntime({now: fixedNow, runtimeAgents:registry});
    const planned = runtime.plan('Find a client and prepare outreach');
    const pending = await runtime.run('Find a client and prepare outreach', 'user-1');
    expect(pending.results.some((result) => result.status === 'WAITING_APPROVAL')).toBe(true);
    const approved = planned.approvals.map((gate) => ({...gate, status:'approved' as const}));
    const completed = await runtime.run('Find a client and prepare outreach', 'user-1', approved);
    expect(completed.results.some((result) => result.status === 'COMPLETED')).toBe(true);
  });

  it('persists completion state and records a measurable next action', async () => {
    const registry = new RuntimeAgentRegistry().register(researchAgent());
    const runtime = new NexusRuntime({now: fixedNow, runtimeAgents:registry});
    const result = await runtime.run('Find investors for my AI company', 'user-1');
    const state = runtime.getExecutionState(result.execution.executionId);
    const outcome = runtime.getOutcome(result.execution.executionId);
    expect(state?.status).toBe('COMPLETED');
    expect(state?.completedSteps.length).toBe(result.execution.steps.length);
    expect(outcome?.status).toBe('SUCCEEDED');
    expect(outcome?.nextAction).toBe('INVESTIGATE');
  });

  it('retries a transient agent failure without losing the execution', async () => {
    const registry = new RuntimeAgentRegistry().register(researchAgent(1));
    const runtime = new NexusRuntime({now: fixedNow, runtimeAgents:registry, maxRetries:1});
    const result = await runtime.run('Find clients for my service', 'user-1');
    expect(result.results.some((step) => step.status === 'COMPLETED')).toBe(true);
    expect(result.results.some((step) => step.attempts === 2)).toBe(true);
    expect(runtime.getOutcome(result.execution.executionId)?.status).toBe('SUCCEEDED');
  });

  it('fuses canonical opportunity discovery before agent execution', async () => {
    let seen: unknown;
    const registry = new RuntimeAgentRegistry().register(researchAgent(0, (input) => { seen = input; }));
    const runtime = new NexusRuntime({
      now: fixedNow,
      runtimeAgents:registry,
      intelligence:{
        async discoverOpportunities(){ return [{opportunity,signals:{relevance:1,fit:1,timing:1,access:0.8,value:0.7,urgency:0.9,competition:0.2,effort:0.2,risk:0.1,confidence:0.95}}]; },
        async findWarmPaths(){ return [{pathId:'warm-1',authorized:true}]; },
        async research(){ return {source:'canonical-test-provider'}; },
      },
    });
    const result = await runtime.run('Find a perfume distributor in Kenya', 'user-1');
    expect(result.rankedOpportunities[0]?.opportunity.id).toBe('opp-1');
    expect(result.intelligence.warmPaths).toHaveLength(1);
    expect(result.intelligence.research.source).toBe('canonical-test-provider');
    expect(JSON.stringify(seen)).toContain('opp-1');
  });
});
