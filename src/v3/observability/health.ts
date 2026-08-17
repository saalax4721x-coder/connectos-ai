import type {RunMetric} from './run-metric'; export const healthRate=(m:RunMetric[])=>m.length?m.filter(x=>!x.error).length/m.length:1;
