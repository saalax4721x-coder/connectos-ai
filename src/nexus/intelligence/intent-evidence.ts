import type { IntentSignal } from './intent-signals';
export interface IntentEvidence { signal: IntentSignal; rationale: string; observedAt: string; }
export function createIntentEvidence(signal: IntentSignal, rationale: string, observedAt = new Date().toISOString()): IntentEvidence { return {signal, rationale, observedAt}; }
