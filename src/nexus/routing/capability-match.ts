import type {AgentCapability} from './agent-capability';
export const capabilityMatch=(a:AgentCapability,need:string)=>a.capability.toLowerCase()===need.toLowerCase()?a.confidence:0;
