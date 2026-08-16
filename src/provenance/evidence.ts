export type EvidenceStatus='verified'|'public-source'|'self-reported'|'community-signal'|'ai-inference'|'unknown';
export interface Evidence{claim:string;status:EvidenceStatus;sources:string[];confidence:number;}
