export interface FitSignal { dimension:string; score:number; reason:string; }
export const fitAverage=(signals:FitSignal[])=>signals.length?signals.reduce((a,s)=>a+s.score,0)/signals.length:0;
