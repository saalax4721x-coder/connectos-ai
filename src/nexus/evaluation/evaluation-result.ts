export interface EvaluationResult { caseId: string; scores: Record<string, number>; passed: boolean; notes: string[]; }
export function evaluationPassed(scores: Record<string, number>, threshold=0.7): boolean { const values=Object.values(scores); return values.length>0 && values.every(v => v >= threshold); }
