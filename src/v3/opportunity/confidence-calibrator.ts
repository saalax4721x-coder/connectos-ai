export interface ConfidenceSignal {name:string;value:number;}
export function calibrateConfidence(signals:ConfidenceSignal[]):number{return signals.length?signals.reduce((a,b)=>a+b.value,0)/signals.length:0;}
