export interface OpportunityEvidence{id:string;source:string;claim:string;observedAt:string;verifiedAt?:string;confidence:number;}
export const stale=(e:OpportunityEvidence,maxAgeMs:number,now=Date.now())=>now-new Date(e.verifiedAt??e.observedAt).getTime()>maxAgeMs;
