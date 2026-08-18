export interface LoopGuard { maxIterations:number; iteration:number; }
export function canContinueLoop(g:LoopGuard):boolean{return g.iteration<g.maxIterations;}
