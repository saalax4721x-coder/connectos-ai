export type ConfidenceBand='low'|'medium'|'high'; export const confidenceBand=(v:number):ConfidenceBand=>v>=.8?'high':v>=.5?'medium':'low';
