export interface ProvenanceAssertion { claim:string; sources:string[]; confidence:number; status:'supported'|'uncertain'|'contradicted'; }
