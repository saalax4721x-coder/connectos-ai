export interface MemoryFreshness { lastObservedAt: string; staleAfterMs: number; }
export function isStale(memory: MemoryFreshness, now=Date.now()): boolean { return now - Date.parse(memory.lastObservedAt) > memory.staleAfterMs; }
