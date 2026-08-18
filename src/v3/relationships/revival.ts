export interface RevivalCandidate { relationshipId:string; lastContactDays:number; relevance:number; }
export const revivalPriority=(c:RevivalCandidate)=>c.relevance*Math.min(1,c.lastContactDays/180);
