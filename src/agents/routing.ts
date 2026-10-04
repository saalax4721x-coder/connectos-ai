import type { AgentContext } from './context';
import type { RuntimeAgent } from './runtime-registry';
import type { AgentCapabilities } from './capabilities';

export interface AgentRouteRequest {
  requiredCapabilities?: Partial<Record<keyof Omit<AgentCapabilities, 'domains'>, boolean>>;
  domain?: string;
  skills?: string[];
  tools?: string[];
  context: AgentContext;
}
export interface AgentRouteCandidate { agentId:string; score:number; reasons:string[]; }
const capabilityKeys: Array<keyof Omit<AgentCapabilities,'domains'>> = ['reasoning','search','vision','audio','externalActions'];
export function routeAgents(agents: RuntimeAgent[], request: AgentRouteRequest): AgentRouteCandidate[] {
  return agents.filter(a=>a.status==='active').map(agent=>{
    let score=0; const reasons:string[]=[];
    if(request.domain){ if(agent.domain===request.domain){score+=30;reasons.push('domain match');} else score-=20; }
    for(const skill of request.skills??[]) { if(agent.skills.includes(skill)){score+=10;reasons.push('skill:'+skill);} else score-=2; }
    for(const tool of request.tools??[]) { if(agent.tools.includes(tool)){score+=6;reasons.push('tool:'+tool);} else score-=4; }
    for(const key of capabilityKeys){const required=request.requiredCapabilities?.[key]; if(required===undefined) continue; const has=agent.capabilities.includes(key); if(required&&has){score+=12;reasons.push(key+':supported');} else if(required&&!has) score-=40; else if(!required&&!has) score+=2;}
    return {agentId:agent.id,score,reasons};
  }).filter(c=>c.score>=0).sort((a,b)=>b.score-a.score||a.agentId.localeCompare(b.agentId));
}
export function selectAgent(agents:RuntimeAgent[],request:AgentRouteRequest):RuntimeAgent|undefined { const candidate=routeAgents(agents,request)[0]; return candidate?agents.find(a=>a.id===candidate.agentId):undefined; }
