export interface RetentionPolicy { maxAgeMs?: number; scopes: string[]; }
export function retentionApplies(policy: RetentionPolicy, scope: string): boolean { return policy.scopes.length === 0 || policy.scopes.includes(scope); }
