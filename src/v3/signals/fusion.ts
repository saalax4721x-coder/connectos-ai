export interface WeightedSignal { value:number; weight:number; }
export const fuseSignals=(signals:WeightedSignal[])=>{const w=signals.reduce((a,s)=>a+s.weight,0);return w?signals.reduce((a,s)=>a+s.value*s.weight,0)/w:0;};
