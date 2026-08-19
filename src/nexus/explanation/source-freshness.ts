export const freshness=(verifiedAt:string,now=Date.now())=>Math.max(0,1-(now-Date.parse(verifiedAt))/(90*86400000));
