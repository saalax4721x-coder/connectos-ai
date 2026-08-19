import type {GoalRisk} from './goal-risk';
export const aggregateRisk=(items:GoalRisk[])=>items.length?items.reduce((s,x)=>s+x.score,0)/items.length:0;
