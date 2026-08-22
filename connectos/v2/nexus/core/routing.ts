export interface AgentCapability { agentId: string; capabilities: string[]; domains: string[]; permissions: string[]; }
export interface RouteRequest { capability: string; domain?: string; permission?: string; }
export interface RouteResult { agentId?: string; candidates: string[]; reason: string; }

export function routeAgent(request: RouteRequest, registry: AgentCapability[]): RouteResult {
  const candidates = registry.filter((agent) => agent.capabilities.includes(request.capability) && (!request.domain || agent.domains.includes(request.domain)) && (!request.permission || agent.permissions.includes(request.permission))).map((agent) => agent.agentId);
  return { agentId: candidates[0], candidates, reason: candidates.length ? 'Matched required capability and constraints' : 'No registered agent satisfies the requested capability and constraints' };
}
