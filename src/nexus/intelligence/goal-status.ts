export type GoalStatus = 'draft' | 'active' | 'blocked' | 'completed' | 'abandoned';
export function canAdvanceGoal(status: GoalStatus): boolean { return status === 'draft' || status === 'active'; }
