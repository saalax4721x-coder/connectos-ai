export type ExecutionStatus = 'PENDING' | 'RUNNING' | 'WAITING_APPROVAL' | 'RETRYING' | 'FAILED' | 'COMPLETED' | 'CANCELLED';

export interface ExecutionStep { id: string; action: string; status: ExecutionStatus; attempts: number; maxAttempts: number; error?: string; output?: unknown; }
export interface ExecutionState { id: string; status: ExecutionStatus; steps: ExecutionStep[]; createdAt: string; updatedAt: string; }

export function startExecution(id: string, steps: Array<{ id: string; action: string }>, now = new Date().toISOString()): ExecutionState {
  return { id, status: 'RUNNING', createdAt: now, updatedAt: now, steps: steps.map((step) => ({ ...step, status: 'PENDING', attempts: 0, maxAttempts: 3 })) };
}

export function transitionStep(state: ExecutionState, stepId: string, status: ExecutionStatus, patch: Partial<ExecutionStep> = {}, now = new Date().toISOString()): ExecutionState {
  const steps = state.steps.map((step) => step.id === stepId ? { ...step, status, ...patch } : step);
  const nextStatus = steps.some((step) => step.status === 'FAILED') ? 'FAILED' : steps.every((step) => step.status === 'COMPLETED') ? 'COMPLETED' : steps.some((step) => step.status === 'WAITING_APPROVAL') ? 'WAITING_APPROVAL' : 'RUNNING';
  return { ...state, steps, status: nextStatus, updatedAt: now };
}

export function retryStep(state: ExecutionState, stepId: string, now = new Date().toISOString()): ExecutionState {
  const steps = state.steps.map((step) => {
    if (step.id !== stepId || step.attempts >= step.maxAttempts || step.status === 'COMPLETED') return step;
    return { ...step, attempts: step.attempts + 1, status: 'RETRYING', error: undefined };
  });
  return { ...state, steps, status: 'RETRYING', updatedAt: now };
}
