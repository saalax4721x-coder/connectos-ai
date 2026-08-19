import type {PlanAlternative} from './plan-alternative';
export const selectPlan=(plans:PlanAlternative[])=>plans.reduce((best,p)=>!best||p.score>best.score?p:best,null as PlanAlternative|null);
