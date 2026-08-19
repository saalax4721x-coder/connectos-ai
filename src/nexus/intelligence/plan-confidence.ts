export interface PlanConfidence { score: number; evidenceCount: number; unresolvedCount: number; }
export function planConfidence(evidenceCount: number, unresolvedCount: number): PlanConfidence { const raw = evidenceCount / Math.max(1, evidenceCount + unresolvedCount); return {score: raw, evidenceCount, unresolvedCount}; }
