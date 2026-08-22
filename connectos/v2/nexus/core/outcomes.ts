export type OutcomeKind = 'SUCCESS' | 'FAILURE' | 'IGNORED' | 'CORRECTED' | 'ABANDONED';
export interface OutcomeRecord { id: string; goalId: string; kind: OutcomeKind; metric?: string; value?: number; feedback?: string; createdAt: string; provenance: string; }

export function outcomeSignal(outcomes: OutcomeRecord[], goalId: string): { successRate: number; count: number; lastKind?: OutcomeKind } {
  const relevant = outcomes.filter((outcome) => outcome.goalId === goalId);
  if (!relevant.length) return { successRate: 0, count: 0 };
  const successes = relevant.filter((outcome) => outcome.kind === 'SUCCESS').length;
  const latest = relevant.slice().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];
  return { successRate: successes / relevant.length, count: relevant.length, lastKind: latest.kind };
}
