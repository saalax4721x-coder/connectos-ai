export interface AgentCapability {agentId:string;capabilities:string[];}
export function matchesCapability(agent:AgentCapability,need:string):boolean{return agent.capabilities.includes(need);}
