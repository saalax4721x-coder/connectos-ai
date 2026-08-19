export const retryDelay=(attempt:number,base=500,max=30000)=>Math.min(max,base*2**Math.max(0,attempt-1));
