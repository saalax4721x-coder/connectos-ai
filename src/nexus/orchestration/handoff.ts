export interface AgentHandoff { fromAgent: string; toAgent: string; taskId: string; contextKeys: string[]; }
export function validateHandoff(handoff: AgentHandoff): boolean { return !!handoff.fromAgent && !!handoff.toAgent && !!handoff.taskId; }
