export interface AgentRequirement { capability: string; minimumConfidence: number; mandatory: boolean; }
export function requirementMet(requirement: AgentRequirement, confidence: number): boolean { return confidence >= requirement.minimumConfidence; }
