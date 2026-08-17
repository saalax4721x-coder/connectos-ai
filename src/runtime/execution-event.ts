export type ExecutionEventType='started'|'step'|'handoff'|'tool'|'approval-requested'|'completed'|'failed';
export interface ExecutionEvent { id:string; runId:string; type:ExecutionEventType; at:string; payload:Record<string,unknown>; }
