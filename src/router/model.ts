export type ModelCapability='reasoning'|'search'|'vision'|'audio'|'embedding'|'classification'|'generation';
export interface ModelDescriptor{id:string;provider:string;capabilities:ModelCapability[];costPerUnit:number;latencyMs:number;quality:number;limits:Record<string,number>;}
