export interface CostEstimate{credits:number;modelCost:number;toolCost:number;latencyMs:number;confidence:number;} export const totalCost=(x:CostEstimate)=>x.modelCost+x.toolCost;
