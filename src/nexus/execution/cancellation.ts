export interface CancellationToken { cancelled: boolean; reason?: string; }
export function cancel(token: CancellationToken, reason: string): CancellationToken { return {cancelled:true, reason}; }
