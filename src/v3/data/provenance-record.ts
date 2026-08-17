export interface ProvenanceRecord{sourceId:string;claim:string;capturedAt:string;sourceDate?:string;lastVerified?:string;confidence:number;method:'direct'|'derived'|'inferred';}
