export interface ExecutionBudget { credits: number; toolCalls: number; milliseconds: number; }
export function withinBudget(used: ExecutionBudget, limit: ExecutionBudget): boolean { return used.credits <= limit.credits && used.toolCalls <= limit.toolCalls && used.milliseconds <= limit.milliseconds; }
