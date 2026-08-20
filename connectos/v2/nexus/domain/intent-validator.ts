import type { Intent } from './types';

export interface ValidationResult {
  valid: boolean;
  issues: string[];
}

export function validateIntent(intent: Intent): ValidationResult {
  const issues: string[] = [];

  if (!intent.id) issues.push('Intent requires an id');
  if (!intent.userId) issues.push('Intent requires a user id');
  if (!intent.goal.value) issues.push('Goal is required');

  for (const entity of intent.entities) {
    if (entity.verified && entity.inferred) {
      issues.push('Inferred data cannot be marked verified');
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
