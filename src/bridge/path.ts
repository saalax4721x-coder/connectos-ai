export interface BridgePath{nodes:string[];edges:string[];strength:number;reason:string;confidence:number;}
export type PathKind='direct'|'mutual'|'second-degree'|'community'|'event'|'public';
