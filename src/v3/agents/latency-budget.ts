export interface LatencyBudget { remainingMs:number; }
export const canRunWithin=(b:LatencyBudget,estimateMs:number)=>estimateMs<=b.remainingMs;
