import type { PlanGraph } from './plan-graph';
export interface PlanValidation { valid: boolean; errors: string[]; }
export function validatePlan(graph: PlanGraph): PlanValidation { const ids = new Set(graph.nodes.map(n => n.id)); const errors = graph.edges.flatMap(e => ids.has(e.from) && ids.has(e.to) ? [] : [`missing endpoint for ${e.from}->${e.to}`]); return {valid: errors.length === 0, errors}; }
