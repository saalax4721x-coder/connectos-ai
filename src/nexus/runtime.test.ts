import {describe, expect, it} from 'vitest';
import {parseGoalIntent} from '../intent/parser';
import {NexusRuntime} from './runtime';

const fixedNow = () => 1720000000000;

describe('NEXUS runtime', () => {
  it('extracts structured intent without inventing missing values', () => {
    const intent = parseGoalIntent('Find three distributors in Kenya for my perfume brand', fixedNow());
    expect(intent.location).toBe('Kenya');
    expect(intent.peopleRequired).toContain('distributor');
    expect(intent.budget).toBeUndefined();
  });

  it('creates a dependency-ordered plan with guarded outreach', () => {
    const runtime = new NexusRuntime({now: fixedNow});
    const result = runtime.plan('Find three serious distributors in Kenya for my perfume brand');
    expect(result.plan.steps.length).toBeGreaterThan(3);
    expect(result.plan.steps[1].dependsOn).toEqual([result.plan.steps[0].id]);
    expect(result.approvals.length).toBeGreaterThan(0);
  });

  it('never treats pending approval as approved', () => {
    const runtime = new NexusRuntime({now: fixedNow});
    const result = runtime.execute('Find a client and prepare outreach');
    expect(result.status).toBe('WAITING_APPROVAL');
  });

  it('allows explicitly approved consequential steps to proceed', () => {
    const runtime = new NexusRuntime({now: fixedNow});
    const planned = runtime.plan('Find a client and prepare outreach');
    const approved = planned.approvals.map((gate) => ({...gate, status: 'approved' as const}));
    const result = runtime.execute('Find a client and prepare outreach', approved);
    expect(result.status).toBe('READY');
  });
});
