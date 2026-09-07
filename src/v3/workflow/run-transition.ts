import type { WorkflowRunStatus } from './run-status';

const next: Record<WorkflowRunStatus, WorkflowRunStatus[]> = {
  queued: ['running', 'cancelled'],
  running: ['waiting-approval', 'paused', 'completed', 'failed', 'cancelled'],
  'waiting-approval': ['running', 'cancelled'],
  paused: ['running', 'cancelled'],
  completed: [],
  failed: ['running'],
  cancelled: [],
};

export const canRunTransition = (from: WorkflowRunStatus, to: WorkflowRunStatus): boolean =>
  next[from].includes(to);
