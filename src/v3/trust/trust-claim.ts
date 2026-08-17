import type {TrustState} from './trust-state'; export interface TrustClaim{claim:string;state:TrustState;sourceIds:string[];confidence:number;observedAt:string;lastVerified?:string;}
