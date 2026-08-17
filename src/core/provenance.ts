export type ProvenanceKind='verified'|'public-source'|'self-reported'|'community-signal'|'ai-inference'|'unknown';

export interface Provenance { sourceId?: string; sourceUrl?: string; sourceType?: string; observedAt: string; lastVerifiedAt?: string; kind: ProvenanceKind; confidence: number; }

export function assertConfidence(value:number):number { if(!Number.isFinite(value)||value<0||value>1) throw new Error('confidence must be between 0 and 1'); return value; }
