export interface RankingSignal { name:string; weight:number; value:number; }
export const weightedRank=(signals:RankingSignal[])=>signals.reduce((a,s)=>a+s.weight*s.value,0);
