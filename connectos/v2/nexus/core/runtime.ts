import { analyzeIntent } from '../domain/intent-runtime';
import { createGoalFromIntent } from '../domain/goal-runtime';
import { createNexusContext } from './context';
import { buildPlan } from './planner';
import { evaluatePlan } from './evaluator';

export interface NexusRunInput { userId: string; text: string; source?: string; now?: string; }
export interface NexusRunResult {
  context: ReturnType<typeof createNexusContext>;
  clarificationNeeded: boolean;
  missing: string[];
  evaluation: ReturnType<typeof evaluatePlan>;
}

export function runNexus(input: NexusRunInput): NexusRunResult {
  const analysis = analyzeIntent(input);
  const goals = createGoalFromIntent(analysis.intent, input.now);
  const context = createNexusContext(input.userId, analysis.intent, input.now);
  context.rootGoal = goals.root;
  context.plan = buildPlan(goals.root, goals.goals, input.now);
  const evaluation = evaluatePlan(context.plan);
  return { context, clarificationNeeded: analysis.clarificationNeeded, missing: analysis.missing, evaluation };
}
