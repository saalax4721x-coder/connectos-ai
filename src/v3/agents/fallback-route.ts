export interface FallbackRoute { primary:string; fallbacks:string[]; }
export const nextFallback=(r:FallbackRoute,failed:string)=>r.fallbacks.find(x=>x!==failed);
