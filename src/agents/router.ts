import type {AgentCapabilities} from './capabilities';
import type {AgentContext} from './context';
import type {RuntimeAgent} from './runtime-registry';

export interface AgentRouteRequest {
  requiredCapabilities?: Partial<Record<keyof AgentCapabilities, boolean>>;
  domain?: string;
  skills?: string[];
  tools?: string[];
  context: AgentContext;
}

export interface AgentRouteCandidate {
  agentId: string;
  score: number;
  reasons: string[];
}

const capabilityKeys: Array<keyof AgentCapabilities> = ['reasoning','search','vision','audio','externalActions'];

export function routeAgents(agents: RuntimeAgent[], request: AgentRouteRequest): AgentRouteCandidate[] {
  return agents
    .filter(agent => agent.status === 'active')
    .map(agent => {
      let score = 0;
      const reasons: string[] = [];
      if (request.domain && agent.domain === request.domain) { score += 30; reasons.push('domain match'); }
      for (const skill of request.skills ?? []) if (agent.skills.includes(skill)) { score += 10; reasons.push(`skill:${skill}`); }
      for (const tool of request.tools ?? []) if (agent.tools.includes(tool)) { score += 6; reasons.push(`tool:${tool}`); }
      for (const key of capabilityKeys) {
        const required = request.requiredCapabilities?.[key];
        if (required === undefined) continue;
        const has = key === 'domains' ? false : Boolean((agent.capabilities as string[]).includes(key));
        if (required === has) { score += required ? 12 : 2; reasons.push(`${key}:${has}`); }
        else score -= 25;
      }
      return {agentId: agent.id, score, reasons};
    })
    .filter(candidate => candidate.score >= 0)
    .sort((a,b) => b.score - a.score || a.agentId.localeCompare(b.agentId));
}
