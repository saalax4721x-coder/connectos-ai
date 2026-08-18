export interface RawIntent {
  text: string;
  source: 'user';
}

export interface NormalizedIntent {
  goal: string;
  entities: string[];
  constraints: string[];
}

export function normalizeIntent(intent: RawIntent): NormalizedIntent {
  return {
    goal: intent.text.trim(),
    entities: [],
    constraints: []
  };
}
