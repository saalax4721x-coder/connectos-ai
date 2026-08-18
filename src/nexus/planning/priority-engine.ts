export interface PrioritySignal {
  name: string;
  weight: number;
}

export function calculatePriority(signals: PrioritySignal[]): number {
  return signals.reduce((sum, signal) => sum + signal.weight, 0);
}
