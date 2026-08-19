export interface PlanRisk { category: 'data' | 'execution' | 'privacy' | 'financial'; level: 'low' | 'medium' | 'high'; mitigation?: string; }
export function requiresEscalation(risk: PlanRisk): boolean { return risk.level === 'high'; }
