import type {RunMetric} from './run-metric'; export const averageCredits=(m:RunMetric[])=>m.length?m.reduce((s,x)=>s+x.credits,0)/m.length:0;
