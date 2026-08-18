export interface AgentCapabilityContract {agentId:string;capabilities:string[];permissions:string[];}
export function supportsCapability(agent:AgentCapabilityContract,capability:string){return agent.capabilities.includes(capability);}
