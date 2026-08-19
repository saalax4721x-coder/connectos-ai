export interface RequirementConflict { leftId: string; rightId: string; reason: string; severity: 'low' | 'medium' | 'high'; }
export function conflictIsBlocking(conflict: RequirementConflict): boolean { return conflict.severity === 'high'; }
