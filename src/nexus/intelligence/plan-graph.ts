import type { PlanNode } from './plan-node';
import type { PlanEdge } from './plan-edge';
export interface PlanGraph { nodes: PlanNode[]; edges: PlanEdge[]; }
export function emptyPlanGraph(): PlanGraph { return {nodes: [], edges: []}; }
