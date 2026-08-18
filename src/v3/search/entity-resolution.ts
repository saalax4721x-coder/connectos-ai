export interface EntityCandidate {id:string;name:string;confidence:number;}
export function rankEntityCandidates(items:EntityCandidate[]):EntityCandidate[]{return [...items].sort((a,b)=>b.confidence-a.confidence);}
