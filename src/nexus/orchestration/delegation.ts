export interface Delegation { workflowId: string; agentId: string; taskId: string; reason: string; }
export function createDelegation(workflowId:string, agentId:string, taskId:string, reason:string): Delegation { return {workflowId,agentId,taskId,reason}; }
