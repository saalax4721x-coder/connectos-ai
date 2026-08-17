import type {WorkflowStep} from './step'; export interface Workflow{id:string;name:string;version:string;steps:WorkflowStep[];inputSchema:string;outputSchema:string;permissions:string[];}
