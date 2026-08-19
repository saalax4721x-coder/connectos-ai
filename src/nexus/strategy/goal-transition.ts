import type {GoalCycleState} from './goal-cycle';
const allowed:Record<GoalCycleState,GoalCycleState[]>={draft:['ready','cancelled'],ready:['active','cancelled'],active:['blocked','completed','cancelled'],blocked:['active','cancelled'],completed:[],cancelled:[]};
export const canTransition=(a:GoalCycleState,b:GoalCycleState)=>allowed[a].includes(b);
