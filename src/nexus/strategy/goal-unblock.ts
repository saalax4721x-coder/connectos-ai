import type {GoalBlocker} from './goal-blocker';
export const rankUnblockers=(items:GoalBlocker[])=>[...items].sort((a,b)=>b.severity.localeCompare(a.severity));
