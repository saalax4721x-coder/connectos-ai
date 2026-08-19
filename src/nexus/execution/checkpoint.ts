export interface ExecutionCheckpoint { workflowId: string; taskId: string; state: string; createdAt: string; resumable: boolean; }
export function checkpoint(workflowId:string, taskId:string, state:string, resumable=true): ExecutionCheckpoint { return {workflowId,taskId,state,resumable,createdAt:new Date().toISOString()}; }
