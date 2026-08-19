export interface MemoryConsent { userId: string; scope: string; allowed: boolean; grantedAt?: string; }
export function canUseMemory(consent: MemoryConsent): boolean { return consent.allowed; }
