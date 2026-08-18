export interface ObjectiveModel {
  id:string;
  goalId:string;
  priority:number;
  successCriteria:string[];
  constraints:string[];
}

export function normalizePriority(value:number){return Math.max(0,Math.min(1,value));}
