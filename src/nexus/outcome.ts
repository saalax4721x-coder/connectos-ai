export type NexusOutcomeStatus = 'SUCCEEDED' | 'FAILED' | 'PARTIAL' | 'ABANDONED';
export type NexusNextAction = 'CONNECT' | 'MESSAGE' | 'REQUEST_INTRODUCTION' | 'COLLABORATE' | 'HIRE' | 'PARTNER' | 'INVESTIGATE' | 'SAVE' | 'FOLLOW' | 'CREATE_DEAL_ROOM' | 'REVIEW';

export interface NexusOutcome {
  executionId: string;
  status: NexusOutcomeStatus;
  completedStepIds: string[];
  failedStepIds: string[];
  summary: string;
  nextAction: NexusNextAction;
  confidence: number;
  source: string[];
  recordedAt: number;
}

export interface NexusOutcomeRecorder {
  record(outcome: NexusOutcome): void;
  get(executionId: string): NexusOutcome | undefined;
  list(): NexusOutcome[];
}

export class InMemoryNexusOutcomeRecorder implements NexusOutcomeRecorder {
  private readonly outcomes = new Map<string, NexusOutcome>();

  record(outcome: NexusOutcome): void {
    this.outcomes.set(outcome.executionId, {
      ...outcome,
      completedStepIds: [...outcome.completedStepIds],
      failedStepIds: [...outcome.failedStepIds],
      source: [...outcome.source],
    });
  }

  get(executionId: string): NexusOutcome | undefined {
    return this.outcomes.get(executionId);
  }

  list(): NexusOutcome[] {
    return [...this.outcomes.values()];
  }
}

export function deriveNextAction(goal: string, completedStepIds: string[], failedStepIds: string[]): NexusNextAction {
  if (failedStepIds.length) return 'REVIEW';
  const normalized = goal.toLowerCase();
  if (/invest|fund|capital/.test(normalized)) return 'INVESTIGATE';
  if (/hire|talent|recruit/.test(normalized)) return 'HIRE';
  if (/partner|partnership/.test(normalized)) return 'PARTNER';
  if (/collaborat|cofound/.test(normalized)) return 'COLLABORATE';
  if (/introduc|warm path/.test(normalized)) return 'REQUEST_INTRODUCTION';
  if (/deal|contract/.test(normalized)) return 'CREATE_DEAL_ROOM';
  if (/message|contact|client|customer/.test(normalized)) return 'MESSAGE';
  if (/save|watch/.test(normalized)) return 'SAVE';
  return completedStepIds.length ? 'REVIEW' : 'INVESTIGATE';
}
