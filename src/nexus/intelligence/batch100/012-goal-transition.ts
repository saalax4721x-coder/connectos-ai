import type { GoalState } from './011-goal-state';
export const canTransition=(from:GoalState,to:GoalState)=>from!==to;
