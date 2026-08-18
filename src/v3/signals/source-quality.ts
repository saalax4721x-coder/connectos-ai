export interface SourceQuality { source:string; reliability:number; provenance:string; }
export const sourceRank=(s:SourceQuality)=>Math.max(0,Math.min(1,s.reliability));
