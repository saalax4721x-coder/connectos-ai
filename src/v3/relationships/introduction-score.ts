export interface IntroductionPath { hops:number; strength:number; relevance:number; }
export const introductionScore=(p:IntroductionPath)=>Math.max(0,p.strength*.5+p.relevance*.4+(1/Math.max(1,p.hops))*.1);
