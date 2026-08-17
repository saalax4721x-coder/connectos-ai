export interface LoopPolicy{maxIterations:number;stopOn:string;onFailure:'stop'|'continue';} export const withinIterations=(iteration:number,p:LoopPolicy)=>iteration<p.maxIterations;
