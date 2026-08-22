export type RuntimeState = 'queued' | 'running' | 'waiting_approval' | 'completed' | 'failed';

const transitions: Record<RuntimeState, RuntimeState[]> = {
  queued: ['running'],
  running: ['waiting_approval', 'completed', 'failed'],
  waiting_approval: ['running', 'failed'],
  completed: [],
  failed: [],
};

export const canTransition = (from: RuntimeState, to: RuntimeState): boolean =>
  from === to || transitions[from].includes(to);
