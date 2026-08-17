export interface ExecutionBudget { maxSteps:number; maxToolCalls:number; maxLatencyMs:number; maxCredits:number; }
export const budgetAllows=(used:{steps:number;toolCalls:number;latencyMs:number;credits:number}, b:ExecutionBudget)=>used.steps<b.maxSteps&&used.toolCalls<b.maxToolCalls&&used.latencyMs<b.maxLatencyMs&&used.credits<=b.maxCredits;
