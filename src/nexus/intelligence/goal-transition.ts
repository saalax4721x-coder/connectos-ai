import type { GoalStatus } from './goal-status';
export interface GoalTransition { from: GoalStatus; to: GoalStatus; reason: string; }
export function transition(from: GoalStatus, to: GoalStatus, reason: string): GoalTransition { return {from,to,reason}; }
