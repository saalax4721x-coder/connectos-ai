export interface TimeoutPolicy { taskMs: number; workflowMs: number; }
export function timeoutReached(startedAt:number, now:number, limit:number): boolean { return now - startedAt >= limit; }
