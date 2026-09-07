export type OutcomeKind = 'SUCCESS' | 'FAILURE' | 'IGNORED' | 'CORRECTED' | 'ABANDONED';

export interface NexusLearningOutcome {
  planId: string;
  kind: OutcomeKind;
  metric?: string;
  value?: number;
  feedback?: string;
  occurredAt: string;
  provenance: string;
}

export interface LearnedSignal {
  sampleCount: number;
  successRate: number;
  correctionRate: number;
  lastOutcome?: OutcomeKind;
}

export function learnFromOutcomes(outcomes: NexusLearningOutcome[], planId: string): LearnedSignal {
  const relevant = outcomes.filter((outcome) => outcome.planId === planId);
  if (!relevant.length) return { sampleCount: 0, successRate: 0, correctionRate: 0 };
  const success = relevant.filter((outcome) => outcome.kind === 'SUCCESS').length;
  const corrected = relevant.filter((outcome) => outcome.kind === 'CORRECTED').length;
  const latest = relevant.slice().sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))[0];
  return {
    sampleCount: relevant.length,
    successRate: success / relevant.length,
    correctionRate: corrected / relevant.length,
    lastOutcome: latest.kind,
  };
}

export function confidenceAdjustment(signal: LearnedSignal): number {
  if (!signal.sampleCount) return 0;
  return Math.max(-0.25, Math.min(0.25, (signal.successRate - signal.correctionRate) * 0.25));
}
