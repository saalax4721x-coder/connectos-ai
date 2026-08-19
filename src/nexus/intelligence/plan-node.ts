export type PlanNodeKind = 'goal' | 'research' | 'decision' | 'action' | 'approval' | 'validation';
export interface PlanNode { id: string; kind: PlanNodeKind; label: string; dependencies: string[]; }
