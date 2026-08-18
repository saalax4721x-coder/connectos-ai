export interface CostBudget { limit:number; spent:number; }
export const withinBudget=(b:CostBudget,cost:number)=>b.spent+cost<=b.limit;
