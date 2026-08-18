export interface ModelCandidate { modelId:string; quality:number; cost:number; latency:number; }
export const rankModel=(m:ModelCandidate)=>m.quality/(1+m.cost+.001*m.latency);
