export const isTimedOut=(started:number,timeoutMs:number,now=Date.now())=>now-started>timeoutMs;
