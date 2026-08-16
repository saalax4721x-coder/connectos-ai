import type {Followup} from './followup';
export const rankFollowups=(items:Followup[])=>items.slice().sort((a,b)=>Date.parse(a.dueAt)-Date.parse(b.dueAt));
