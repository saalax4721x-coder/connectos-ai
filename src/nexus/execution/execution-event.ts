export interface ExecutionEvent { workflowId: string; taskId?: string; type: string; timestamp: string; metadata?: Record<string, unknown>; }
export function executionEvent(workflowId:string, type:string, taskId?:string): ExecutionEvent { return {workflowId,taskId,type,timestamp:new Date().toISOString()}; }
