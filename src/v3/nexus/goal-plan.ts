export interface GoalSignal { key: string; value: string; confidence: number; source: string; }
export interface GoalRequirement { key: string; required: boolean; signals: GoalSignal[]; }
export interface GoalPlan { goalId: string; requirements: GoalRequirement[]; }
export function requiredRequirements(plan: GoalPlan): GoalRequirement[] { return plan.requirements.filter(r => r.required); }
