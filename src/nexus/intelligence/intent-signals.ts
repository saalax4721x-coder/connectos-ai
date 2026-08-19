export type IntentSignalKind = 'goal' | 'domain' | 'entity' | 'constraint' | 'urgency';
export interface IntentSignal { kind: IntentSignalKind; value: string; confidence: number; source: 'user' | 'derived'; }
export function normalizeSignal(signal: IntentSignal): IntentSignal { return {...signal, confidence: Math.max(0, Math.min(1, signal.confidence)), value: signal.value.trim()}; }
