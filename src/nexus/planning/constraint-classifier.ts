export type ConstraintType = 'hard' | 'soft';

export interface ConstraintRule {
  id: string;
  type: ConstraintType;
  category: string;
  value: unknown;
}

export function isBlockingConstraint(rule: ConstraintRule): boolean {
  return rule.type === 'hard';
}
