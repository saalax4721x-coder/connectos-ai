export type WorkflowState='pending'|'running'|'waiting-approval'|'succeeded'|'failed'|'cancelled';
export type WorkflowStepState=WorkflowState;
export interface WorkflowStep{id:string;name:string;state:WorkflowStepState;dependsOn:string[];retryLimit:number;attempts:number;output?:unknown;error?:string;agentId?:string;requiresApproval?:boolean;}
export interface WorkflowRun{id:string;goalId:string;state:WorkflowState;steps:WorkflowStep[];startedAt?:string;finishedAt?:string;version:number;}
export interface WorkflowExecutionResult{stepId:string;output?:unknown;error?:string;waitingApproval?:boolean;}