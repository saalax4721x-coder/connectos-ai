import type {Signal} from './signal'; export const signalScore=(s:Signal)=>s.confidence*s.impact;
