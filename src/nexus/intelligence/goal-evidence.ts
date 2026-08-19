export interface GoalEvidence { source: string; observedAt: string; rationale: string; }
export function goalEvidence(source: string, rationale: string): GoalEvidence { return {source, rationale, observedAt: new Date().toISOString()}; }
