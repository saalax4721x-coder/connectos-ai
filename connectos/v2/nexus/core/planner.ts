import type { Goal } from '../domain/types';

export interface PlanStep {
  id: string;
  goalId: string;
  order: number;
  action: string;
  dependencies: string[];
  requiresApproval: boolean;
}

export interface NexusPlan {
  id: string;
  rootGoalId: string;
  steps: PlanStep[];
  status: 'DRAFT' | 'READY';
}

export function buildPlan(root: Goal, goals: Goal[], now = new Date().toISOString()): NexusPlan {
  const byId = new Map(goals.map((goal) => [goal.id, goal]));
  const ordered: Goal[] = [];
  const visit = (id: string, seen = new Set<string>()): void => {
    if (seen.has(id)) return;
    seen.add(id);
    const goal = byId.get(id);
    if (!goal) return;
    goal.dependencies.forEach((dependency) => visit(dependency, seen));
    ordered.push(goal);
  };
  root.childGoalIds.forEach((id) => visit(id));
  if (!ordered.length) ordered.push(root);
  return {
    id: `plan-${root.id}-${Date.parse(now) || now}`,
    rootGoalId: root.id,
    status: 'READY',
    steps: ordered.map((goal, index) => ({
      id: `step-${goal.id}`,
      goalId: goal.id,
      order: index + 1,
      action: goal.title,
      dependencies: goal.dependencies.map((dependency) => `step-${dependency}`),
      requiresApproval: /outreach|contact|send|publish|deal/i.test(goal.title),
    })),
  };
}
