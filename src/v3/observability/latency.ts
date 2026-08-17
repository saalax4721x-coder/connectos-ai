import type {RunMetric} from './run-metric'; export const averageLatency=(m:RunMetric[])=>m.length?m.reduce((s,x)=>s+x.latencyMs,0)/m.length:0;
