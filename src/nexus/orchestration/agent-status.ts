export type AgentStatus = 'queued' | 'running' | 'waiting_approval' | 'blocked' | 'completed' | 'failed';
export function isTerminal(status: AgentStatus): boolean { return status === 'completed' || status === 'failed'; }
