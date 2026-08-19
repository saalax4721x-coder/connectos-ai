export interface RollbackAction { taskId: string; action: string; reversible: boolean; }
export function needsRollback(action: RollbackAction): boolean { return action.reversible; }
