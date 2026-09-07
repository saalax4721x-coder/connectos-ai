import {describe, expect, it} from 'vitest';
import {confidenceAdjustment, learnFromOutcomes} from './outcome-learning';

describe('NEXUS outcome learning', () => {
  it('derives success and correction rates from recorded outcomes', () => {
    const signal = learnFromOutcomes([
      {planId:'p',kind:'SUCCESS',occurredAt:'2026-01-01',provenance:'test'},
      {planId:'p',kind:'CORRECTED',occurredAt:'2026-01-02',provenance:'test'},
      {planId:'p',kind:'SUCCESS',occurredAt:'2026-01-03',provenance:'test'},
    ], 'p');
    expect(signal.sampleCount).toBe(3);
    expect(signal.successRate).toBeCloseTo(2 / 3);
    expect(signal.correctionRate).toBeCloseTo(1 / 3);
    expect(confidenceAdjustment(signal)).toBeGreaterThan(0);
  });
});
