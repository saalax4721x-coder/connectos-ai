import type { AgentCapability } from './agent-capability';
export function rankAgents(agents: AgentCapability[], action: string): AgentCapability[] { return agents.filter(a => supportsAction(a, action)).sort((a,b) => b.confidence-a.confidence); }
function supportsAction(agent: AgentCapability, action: string): boolean { return agent.action === action; }
