import type {TimingSignalRecord} from './timing-signal'; export const timingScore=(signals:TimingSignalRecord[])=>Math.min(1,signals.reduce((s,x)=>s+x.confidence,0)/Math.max(1,signals.length));
