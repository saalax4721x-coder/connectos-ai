import type { TaskDefinition } from './task-definition';
export interface WorkflowDefinition { id:string; name:string; tasks:TaskDefinition[]; version:number; }
