import type { EvaluationDimension } from './evaluation-dimension';
export type EvaluationWeights = Partial<Record<EvaluationDimension, number>>;
export function weightedScore(scores: EvaluationWeights, weights: EvaluationWeights): number { let total=0, weight=0; for (const key of Object.keys(scores) as EvaluationDimension[]) { const w=weights[key] ?? 0; total += (scores[key] ?? 0)*w; weight += w; } return weight ? total/weight : 0; }
