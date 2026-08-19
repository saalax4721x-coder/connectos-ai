export interface IntentScore { relevance:number; completeness:number; confidence:number; total:number; }
export function scoreIntent(relevance:number, completeness:number):IntentScore { const r=Math.max(0,Math.min(1,relevance)); const c=Math.max(0,Math.min(1,completeness)); return {relevance:r,completeness:c,confidence:r*c,total:(r+c)/2}; }
