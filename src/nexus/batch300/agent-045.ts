export interface AgentRun { id:string; agentId:string; startedAt:string; finishedAt?:string; status:'running'|'succeeded'|'failed'; }
