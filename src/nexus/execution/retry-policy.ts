export interface RetryPolicy { maxAttempts: number; backoffMs: number; retryableCodes: string[]; }
export function retryAllowed(policy: RetryPolicy, attempts: number, code: string): boolean { return attempts < policy.maxAttempts && policy.retryableCodes.includes(code); }
