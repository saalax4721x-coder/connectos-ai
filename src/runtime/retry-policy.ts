export interface RetryPolicy{maxAttempts:number;baseDelayMs:number;maxDelayMs:number;backoff:'fixed'|'exponential';}
export const delayFor=(p:RetryPolicy,attempt:number)=>Math.min(p.maxDelayMs,p.baseDelayMs*(p.backoff==='exponential'?2**Math.max(0,attempt-1):1));
