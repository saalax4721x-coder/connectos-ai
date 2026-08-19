import type { ScopedMemory } from './memory-scope';
export function deleteMemory(memories: ScopedMemory[], scope: ScopedMemory['scope'], key: string): ScopedMemory[] { return memories.filter(m => !(m.scope === scope && m.key === key)); }
