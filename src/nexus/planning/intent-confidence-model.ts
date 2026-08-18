export interface IntentConfidenceSignal {
  source: string;
  score: number;
  explanation: string;
}

export interface IntentConfidence {
  score: number;
  signals: IntentConfidenceSignal[];
}

export function calculateIntentConfidence(signals: IntentConfidenceSignal[]): IntentConfidence {
  const score = signals.length === 0 ? 0 : signals.reduce((sum, signal) => sum + signal.score, 0) / signals.length;
  return { score, signals };
}
