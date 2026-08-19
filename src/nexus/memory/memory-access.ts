export interface MemoryAccess { actorId: string; scope: string; action: 'read' | 'write' | 'delete'; }
export function isDestructive(access: MemoryAccess): boolean { return access.action === 'delete'; }
