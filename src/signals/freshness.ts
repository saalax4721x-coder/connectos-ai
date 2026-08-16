export interface Freshness{observedAt:string;sourceDate?:string;lastVerified?:string;maxAgeMs:number;}
export const isStale=(f:Freshness,now=Date.now())=>now-Date.parse(f.observedAt)>f.maxAgeMs;
