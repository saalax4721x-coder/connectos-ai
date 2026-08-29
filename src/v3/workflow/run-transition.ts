import type {WorkflowRunStatus} from './run-status';

const next: Record<WorkflowRunStatus, WorkflowRunStatus[]> = {
  queued: ['running', 'cancelled'],
  running: ['waiting-approval', 'paused', 'completed', 'failed', 'cancelled'],
  'waiting-approval': ['running', 'cancelled'],
  paused: ['running', 'cancelled'],
  completed: [],
  failed: ['running'],
  cancelled: [],
};

export const canRunTransition = (a: WorkflowRunStatus, b: WorkflowRunStatus) =>
  next[a].includes(b);
