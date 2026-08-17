export const freshnessScore=(lastVerified:string,maxAgeMs:number,now=Date.now())=>Math.max(0,Math.min(1,1-(now-new Date(lastVerified).getTime())/maxAgeMs));
