export type GoalHorizon='immediate'|'short_term'|'long_term';
export const rankGoalHorizon=(days:number):GoalHorizon=>days<=7?'immediate':days<=90?'short_term':'long_term';
