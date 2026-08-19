export interface MemoryAudit { actorId: string; action: 'read' | 'write' | 'delete'; scope: string; timestamp: string; }
export function auditMemory(actorId:string, action:MemoryAudit['action'], scope:string): MemoryAudit { return {actorId,action,scope,timestamp:new Date().toISOString()}; }
