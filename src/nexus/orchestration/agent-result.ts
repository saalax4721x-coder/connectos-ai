export interface AgentResult<T = unknown> { agentId: string; taskId: string; output: T; confidence: number; evidence: string[]; warnings: string[]; }
