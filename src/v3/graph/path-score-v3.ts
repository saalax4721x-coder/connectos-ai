export interface GraphPathScore { relevance:number; confidence:number; hops:number; }
export const scorePath=(p:GraphPathScore)=>p.relevance*.5+p.confidence*.4+(1/Math.max(1,p.hops))*.1;
