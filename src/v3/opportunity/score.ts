export interface OpportunityScore{relevance:number;fit:number;timing:number;access:number;value:number;urgency:number;competition:number;effort:number;risk:number;confidence:number;}
export const weighted=(s:OpportunityScore)=>.16*s.relevance+.15*s.fit+.15*s.timing+.12*s.access+.12*s.value+.1*s.urgency+.08*(1-s.competition)+.06*(1-s.effort)+.06*(1-s.risk);
