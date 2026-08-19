export interface GoalSignal { id: string; value: string; confidence: number; source: 'user' | 'derived'; }
export function clampGoalSignal(signal: GoalSignal): GoalSignal { return {...signal, confidence: Math.max(0, Math.min(1, signal.confidence))}; }
