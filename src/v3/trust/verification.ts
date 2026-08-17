import type {TrustClaim} from './trust-claim'; export const needsVerification=(c:TrustClaim)=>c.state!=='verified'&&c.confidence<.8;
