export interface ExecutionBudget { maxSteps:number; maxMs:number; maxCost:number; }
export const withinBudget=(used:{steps:number;ms:number;cost:number},b:ExecutionBudget)=>used.steps<=b.maxSteps&&used.ms<=b.maxMs&&used.cost<=b.maxCost;
