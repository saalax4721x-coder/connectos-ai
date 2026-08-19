export interface IntentLock { intentId:string; lockedBy:string; reason:string; expiresAt?:string; }
export function lockActive(lock:IntentLock, now=Date.now()):boolean { return !lock.expiresAt || Date.parse(lock.expiresAt) > now; }
