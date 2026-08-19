export interface StrategyReview { strategyId:string; evidence:string[]; changedAssumptions:string[]; decision:'continue'|'adapt'|'stop'; }
