import type {GoalHealth} from './goal-health';
export const evaluateHealth=(progress:number,blocked:boolean):GoalHealth=>blocked?'blocked':progress>=1?'complete':progress<.35?'at-risk':'on-track';
