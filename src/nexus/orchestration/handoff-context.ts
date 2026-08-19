export interface HandoffContext { goalId: string; taskId: string; facts: Record<string, unknown>; constraints: string[]; provenance: string[]; }
