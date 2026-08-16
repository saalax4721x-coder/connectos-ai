export type WorkflowStepKind='sequential'|'parallel'|'conditional'|'loop'|'approval'|'handoff'|'schedule'|'trigger';
export interface WorkflowStep{id:string;kind:WorkflowStepKind;dependsOn:string[];agent?:string;}
export interface Workflow{id:string;name:string;steps:WorkflowStep[];version:number;}
