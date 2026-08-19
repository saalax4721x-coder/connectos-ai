export interface RequirementPriority { requirementId: string; weight: number; rationale: string; }
export function normalizeRequirementPriority(value: number): number { return Math.max(0, Math.min(1, value)); }
