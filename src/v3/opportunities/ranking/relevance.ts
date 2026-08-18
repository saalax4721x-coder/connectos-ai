export interface RelevanceSignal {name:string;weight:number;}
export function relevanceScore(signals:RelevanceSignal[]):number{return signals.reduce((a,s)=>a+s.weight,0);}
