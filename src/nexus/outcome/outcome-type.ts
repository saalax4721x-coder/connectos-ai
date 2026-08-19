export type OutcomeType='response'|'meeting'|'introduction'|'hire'|'deal'|'partnership'|'failure'|'ignored';
export interface Outcome { id:string; workflowId:string; type:OutcomeType; value?:number; timestamp:string; }
