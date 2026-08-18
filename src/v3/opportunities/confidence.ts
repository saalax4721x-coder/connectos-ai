export interface OpportunityEvidence { source: string; observedAt: string; weight: number; }
export interface OpportunityConfidence { score: number; evidence: OpportunityEvidence[]; }
export function confidenceFromEvidence(evidence: OpportunityEvidence[]): OpportunityConfidence { const total = evidence.reduce((sum, e) => sum + Math.max(0, e.weight), 0); const score = Math.min(1, total / Math.max(1, evidence.length)); return { score, evidence }; }
