import type { NexusPlan } from './planner';

export interface PlanEvaluation {
  valid: boolean;
  score: number;
  issues: string[];
}

export function evaluatePlan(plan: NexusPlan): PlanEvaluation {
  const issues: string[] = [];
  if (!plan.rootGoalId) issues.push('Plan has no root goal');
  if (!plan.steps.length) issues.push('Plan has no executable steps');
  const orders = plan.steps.map((step) => step.order);
  if (new Set(orders).size !== orders.length) issues.push('Plan contains duplicate step ordering');
  const score = Math.max(0, Math.min(100, 100 - issues.length * 30));
  return { valid: issues.length === 0, score, issues };
}
