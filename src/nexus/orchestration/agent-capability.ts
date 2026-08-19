export interface AgentCapability { id: string; domain: string; action: string; confidence: number; }
export function supports(capability: AgentCapability, action: string): boolean { return capability.action === action && capability.confidence > 0; }
