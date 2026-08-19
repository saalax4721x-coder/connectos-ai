export type PlanEdgeKind = 'depends_on' | 'enables' | 'blocks' | 'alternative';
export interface PlanEdge { from: string; to: string; kind: PlanEdgeKind; }
