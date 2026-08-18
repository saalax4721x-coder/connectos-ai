export interface AmbiguityResult {
  ambiguous: boolean;
  missingFields: string[];
}

export function detectAmbiguity(fields: string[]): AmbiguityResult {
  return { ambiguous: fields.length > 0, missingFields: fields };
}
