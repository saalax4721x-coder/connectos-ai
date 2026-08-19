import type { ScopedMemory } from './memory-scope';
export function upsertMemory(memories: ScopedMemory[], next: ScopedMemory): ScopedMemory[] { const rest = memories.filter(m => !(m.scope === next.scope && m.key === next.key)); return [...rest, next]; }
