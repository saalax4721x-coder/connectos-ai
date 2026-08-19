import type {GoalMetric} from './goal-metric';
export const metricProgress=(m:GoalMetric)=>m.direction==='up'?Math.min(1,m.current/m.target):Math.min(1,m.target/Math.max(m.current,Number.EPSILON));
