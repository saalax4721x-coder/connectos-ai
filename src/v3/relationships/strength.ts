export interface RelationshipSignal { weight:number; evidence:string; }
export const relationshipStrength=(s:RelationshipSignal[])=>Math.min(1,s.reduce((a,x)=>a+x.weight,0));
