import type { Goal, Intent } from './types';

export interface GoalPlan {
  root: Goal;
  goals: Goal[];
}

export function createGoalFromIntent(intent: Intent, now = new Date().toISOString()): GoalPlan {
  const root: Goal = {
    id: `goal-${intent.id}`,
    title: intent.goal.value,
    description: intent.goal.value,
    childGoalIds: [],
    priority: intent.category?.value === 'CAPITAL' ? 90 : 70,
    dependencies: [],
    risks: [],
    status: 'UNDERSTOOD',
    confidence: intent.provenance.confidence,
    outcome: undefined,
  };

  const children = buildChildren(intent, root.id, now);
  root.childGoalIds = children.map((goal) => goal.id);
  root.status = children.length ? 'PLANNED' : 'UNDERSTOOD';
  return { root, goals: [root, ...children] };
}

function buildChildren(intent: Intent, parentGoalId: string, now: string): Goal[] {
  const category = intent.category?.value;
  const steps = category === 'CAPITAL'
    ? ['Define funding criteria', 'Discover relevant investors', 'Research and verify matches', 'Identify decision makers and warm paths', 'Prepare outreach', 'Track responses and outcomes']
    : category === 'CLIENT_ACQUISITION'
      ? ['Define target customer profile', 'Discover target companies', 'Identify decision makers', 'Qualify fit and timing', 'Prepare outreach', 'Track responses and outcomes']
      : ['Clarify success criteria', 'Research relevant people and companies', 'Evaluate options', 'Select next action', 'Track outcome'];

  return steps.map((title, index) => ({
    id: `${parentGoalId}:step-${index + 1}`,
    title,
    description: title,
    parentGoalId,
    childGoalIds: [],
    priority: Math.max(10, 80 - index * 8),
    dependencies: index === 0 ? [] : [`${parentGoalId}:step-${index}`],
    risks: [],
    status: 'CREATED',
    confidence: intent.provenance.confidence,
    outcome: undefined,
  }));
}
