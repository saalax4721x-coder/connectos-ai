export interface RetryPolicy{maxAttempts:number;baseDelayMs:number;maxDelayMs:number;}
export const defaultRetryPolicy:RetryPolicy={maxAttempts:3,baseDelayMs:250,maxDelayMs:4000};
