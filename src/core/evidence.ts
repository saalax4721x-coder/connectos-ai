import type { Provenance } from './provenance';

export interface Evidence<T=unknown> { value:T; provenance:Provenance; }
export interface SourceSnapshot { id:string; capturedAt:string; expiresAt?:string; }

export function isStale(snapshot:SourceSnapshot, now=Date.now()):boolean { return !!snapshot.expiresAt && Date.parse(snapshot.expiresAt)<=now; }
