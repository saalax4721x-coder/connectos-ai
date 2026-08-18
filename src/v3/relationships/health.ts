export type RelationshipState = 'new' | 'active' | 'cooling' | 'dormant';
export interface RelationshipHealth { relationshipId: string; state: RelationshipState; recency: number; reciprocity: number; relevance: number; }
export function relationshipHealth(r: Omit<RelationshipHealth, 'state'>): RelationshipHealth { const avg = (r.recency + r.reciprocity + r.relevance) / 3; return { ...r, state: avg >= .7 ? 'active' : avg >= .4 ? 'cooling' : 'dormant' }; }
