export interface EvaluationScore { accuracy:number; relevance:number; safety:number; provenance:number; }
export const overallScore=(s:EvaluationScore)=>s.accuracy*.3+s.relevance*.3+s.safety*.2+s.provenance*.2;
