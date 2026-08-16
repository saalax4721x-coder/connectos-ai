export interface CostBudget{credits:number;spent:number;hardLimit:boolean;}
export const remainingCredits=(b:CostBudget)=>Math.max(0,b.credits-b.spent);
