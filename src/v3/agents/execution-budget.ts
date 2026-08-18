export interface ExecutionBudget { credits:number; maxToolCalls:number; }
export const canSpend=(b:ExecutionBudget,cost:number)=>cost<=b.credits;
