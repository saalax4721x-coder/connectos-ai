export interface BudgetRange { min?:number; max?:number; currency?:string; flexible:boolean; }
export function budgetAllows(range:BudgetRange, value:number):boolean { return (range.min === undefined || value >= range.min) && (range.max === undefined || value <= range.max); }
