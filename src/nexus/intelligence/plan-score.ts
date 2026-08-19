export interface PlanScore { feasibility: number; expectedValue: number; effort: number; risk: number; }
export function totalPlanScore(score: PlanScore): number { return score.feasibility * 0.35 + score.expectedValue * 0.35 + (1 - score.effort) * 0.15 + (1 - score.risk) * 0.15; }
