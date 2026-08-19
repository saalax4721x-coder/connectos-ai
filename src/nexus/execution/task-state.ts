export type TaskState = 'pending' | 'ready' | 'running' | 'blocked' | 'succeeded' | 'failed';
export function isReady(state: TaskState): boolean { return state === 'ready'; }
