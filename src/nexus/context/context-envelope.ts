export interface ContextEnvelope { goalId:string; intentId:string; userId:string; facts:Record<string,unknown>; constraints:string[]; provenance:string[]; }
