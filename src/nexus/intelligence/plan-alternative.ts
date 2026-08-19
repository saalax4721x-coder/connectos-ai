import type { PlanGraph } from './plan-graph';
export interface PlanAlternative { id: string; graph: PlanGraph; rationale: string; score?: number; }
