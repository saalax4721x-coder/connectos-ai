import type { Intent } from '../domain/types';
import { createGoalFromIntent } from '../domain/goal-runtime';
import { createNexusContext } from './context';
import { buildPlan } from './planner';
import { evaluatePlan } from './evaluator';
import { startExecution } from './execution';
import type { NexusEventSink } from './observability';

export interface NexusRun {
  context: ReturnType<typeof createNexusContext>;
  goals: ReturnType<typeof createGoalFromIntent>;
  plan: ReturnType<typeof buildPlan>;
  evaluation: ReturnType<typeof evaluatePlan>;
  execution: ReturnType<typeof startExecution>;
}

export function orchestrate(userId: string, intent: Intent, sink?: NexusEventSink, now = new Date().toISOString()): NexusRun {
  const context = createNexusContext(userId, intent, now);
  sink?.emit({ id: `${context.id}:intent`, type: 'INTENT', contextId: context.id, timestamp: now, status: 'COMPLETED', metadata: { intentId: intent.id } });
  const goals = createGoalFromIntent(intent, now);
  const plan = buildPlan(goals.root, goals.goals, now);
  const evaluation = evaluatePlan(plan);
  sink?.emit({ id: `${context.id}:plan`, type: 'PLAN', contextId: context.id, timestamp: now, status: evaluation.valid ? 'COMPLETED' : 'FAILED', metadata: { score: evaluation.score, issues: evaluation.issues } });
  if (!evaluation.valid) throw new Error(`NEXUS plan rejected: ${evaluation.issues.join('; ')}`);
  const execution = startExecution(`execution-${context.id}`, plan.steps.map((step) => ({ id: step.id, action: step.action })), now);
  sink?.emit({ id: `${context.id}:execution`, type: 'EXECUTION', contextId: context.id, timestamp: now, status: 'STARTED', metadata: { executionId: execution.id } });
  return { context: { ...context, plan }, goals, plan, evaluation, execution };
}
