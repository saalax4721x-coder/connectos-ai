import type { ScopedMemory } from './memory-scope';
export function retrieveMemories(memories: ScopedMemory[], scope: ScopedMemory['scope'], key?: string): ScopedMemory[] { return memories.filter(m => m.scope === scope && (!key || m.key === key)); }
