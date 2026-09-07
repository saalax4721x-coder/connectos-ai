export type NexusExecutionStatus = 'PLANNED' | 'NEEDS_CLARIFICATION' | 'WAITING_APPROVAL' | 'RUNNING' | 'COMPLETED' | 'PARTIAL' | 'FAILED';

export interface NexusExecutionState {
  executionId: string;
  intentId: string;
  actorId?: string;
  status: NexusExecutionStatus;
  startedAt?: number;
  completedAt?: number;
  updatedAt: number;
  completedSteps: string[];
  failedSteps: string[];
  waitingSteps: string[];
  metadata: Readonly<Record<string, unknown>>;
}

export interface NexusExecutionStateStore {
  get(executionId: string): NexusExecutionState | undefined;
  save(state: NexusExecutionState): void;
  delete(executionId: string): void;
  list(): NexusExecutionState[];
}

export class InMemoryNexusExecutionStateStore implements NexusExecutionStateStore {
  private readonly states = new Map<string, NexusExecutionState>();

  get(executionId: string): NexusExecutionState | undefined {
    return this.states.get(executionId);
  }

  save(state: NexusExecutionState): void {
    this.states.set(state.executionId, {
      ...state,
      completedSteps: [...state.completedSteps],
      failedSteps: [...state.failedSteps],
      waitingSteps: [...state.waitingSteps],
      metadata: Object.freeze({...state.metadata}),
    });
  }

  delete(executionId: string): void {
    this.states.delete(executionId);
  }

  list(): NexusExecutionState[] {
    return [...this.states.values()].map((state) => ({
      ...state,
      completedSteps: [...state.completedSteps],
      failedSteps: [...state.failedSteps],
      waitingSteps: [...state.waitingSteps],
      metadata: Object.freeze({...state.metadata}),
    }));
  }
}
