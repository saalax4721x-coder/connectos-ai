import type {StepKind} from './step-kind'; export interface WorkflowStep{id:string;kind:StepKind;name:string;dependsOn:string[];inputRefs:string[];timeoutMs:number;retryable:boolean;}
