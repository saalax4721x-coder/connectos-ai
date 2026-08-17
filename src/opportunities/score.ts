export interface OpportunitySignals { relevance:number; fit:number; timing:number; access:number; value:number; urgency:number; competition:number; effort:number; risk:number; confidence:number; }
export interface OpportunityScore { total:number; signals:OpportunitySignals; reasons:string[]; }
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export function scoreOpportunity(s:OpportunitySignals):OpportunityScore { const positive=(s.relevance+s.fit+s.timing+s.access+s.value+s.urgency+s.confidence)/7; const penalties=(s.competition+s.effort+s.risk)/3; const total=clamp(positive*0.8+(1-penalties)*0.2); return {total,signals:s,reasons:[`fit ${(s.fit*100).toFixed(0)}%`,`timing ${(s.timing*100).toFixed(0)}%`,`access ${(s.access*100).toFixed(0)}%`,`risk ${(s.risk*100).toFixed(0)}%`]}; }
