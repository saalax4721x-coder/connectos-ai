export type MemoryScope = 'user' | 'relationship' | 'company' | 'opportunity' | 'project' | 'workflow' | 'agent';
export interface ScopedMemory { scope: MemoryScope; key: string; value: unknown; }
