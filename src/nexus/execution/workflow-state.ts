export type WorkflowState = 'draft' | 'ready' | 'running' | 'paused' | 'waiting' | 'completed' | 'failed' | 'cancelled';
export function canExecute(state: WorkflowState): boolean { return state === 'ready' || state === 'running'; }
