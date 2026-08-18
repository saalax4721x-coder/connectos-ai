export interface CompetitionSignal { competitorCount:number; observedAt:string; source:string; }
export const competitionPressure=(s:CompetitionSignal)=>Math.min(1,s.competitorCount/20);
