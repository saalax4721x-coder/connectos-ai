export interface RetryStep { taskId:string; attempts:number; backoffMs:number; }
export function nextAttempt(step:RetryStep):RetryStep { return {...step, attempts:step.attempts+1, backoffMs:Math.max(100, step.backoffMs*2)}; }
