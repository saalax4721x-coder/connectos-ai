export interface WorkflowEvent { type:string; payload:Record<string,unknown>; occurredAt:string; }
export const eventMatches=(e:WorkflowEvent,type:string)=>e.type===type;
