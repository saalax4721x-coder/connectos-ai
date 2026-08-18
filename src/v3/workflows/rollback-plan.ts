export interface RollbackAction { stepId:string; action:string; }
export interface RollbackPlan { workflowId:string; actions:RollbackAction[]; }
