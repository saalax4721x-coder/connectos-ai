export interface AgentFailure { agentId: string; taskId: string; code: string; retryable: boolean; message: string; }
export function shouldRetry(failure: AgentFailure): boolean { return failure.retryable; }
