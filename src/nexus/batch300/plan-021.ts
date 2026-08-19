export interface PlanNode { id:string; action:string; dependsOn:string[]; status:'pending'|'ready'|'running'|'done'|'failed'; }
