export interface EntityCandidate { id: string; aliases: string[]; type: string; }
export function resolveEntity(query: string, candidates: EntityCandidate[]): EntityCandidate[] { const q = query.trim().toLowerCase(); return candidates.filter(c => [c.id, ...c.aliases].some(a => a.toLowerCase() === q || a.toLowerCase().includes(q))); }
