export interface QualityThreshold { minimumConfidence:number; minimumEvidence:number; }
export const qualityPasses=(q:QualityThreshold,confidence:number,evidence:number)=>confidence>=q.minimumConfidence&&evidence>=q.minimumEvidence;
