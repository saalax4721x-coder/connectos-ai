export type WorkflowState='pending'|'running'|'waiting-approval'|'succeeded'|'failed'|'cancelled';
export interface WorkflowStep { id:string; name:string; state:WorkflowState; dependsOn:string[]; retryLimit:number; attempts:number; output?:unknown; error?:string; }
export interface WorkflowRun { id:string; goalId:string; state:WorkflowState; steps:WorkflowStep[]; startedAt?:string; finishedAt?:string; }
