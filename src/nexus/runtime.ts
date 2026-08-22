import type {IntentPlan, IntentStep} from '../intent/plan';
import type {GoalIntent, IntentRequirement} from '../intent/schema';
import {parseGoalIntent} from '../intent/parser';
import {buildRequirements} from '../intent/requirements';
import type {AgentDefinition} from '../agents/agent';
import {AgentRegistry} from '../agents/registry';
import {isApproved, type ApprovalGate} from './execution/approval-gate';

export interface NexusPlanResult {
  intent: GoalIntent;
  requirements: IntentRequirement[];
  plan: IntentPlan;
  approvals: ApprovalGate[];
  unresolved: string[];
}

export interface NexusRuntimeOptions {
  agents?: AgentRegistry;
  now?: () => number;
}

export interface NexusExecution {
  plan: NexusPlanResult;
  status: 'READY' | 'WAITING_APPROVAL' | 'NEEDS_CLARIFICATION';
  steps: Array<IntentStep & {agent?: string}>;
}

const actionRequiresApproval = (purpose: string): boolean => /\b(send|contact|publish|share|create deal|financial|commit)\b/i.test(purpose);

function selectAgent(intent: GoalIntent, purpose: string, agents: AgentDefinition[]): string | undefined {
  const terms = [purpose, intent.industry ?? '', ...intent.skillsRequired].join(' ').toLowerCase();
  return agents.find((agent) => agent.status === 'active' && agent.skills.some((skill) => terms.includes(skill.toLowerCase())))?.id
    ?? agents.find((agent) => agent.status === 'active' && agent.skills.length > 0)?.id;
}

function buildSteps(intent: GoalIntent, requirements: IntentRequirement[], agents: AgentDefinition[]): IntentStep[] {
  const steps: Array<{purpose: string; requiresApproval?: boolean}> = [
    {purpose: 'Validate intent and required constraints'},
    {purpose: 'Research relevant people and companies'},
    {purpose: 'Evaluate matches and opportunity timing'},
    {purpose: 'Select the single highest-value next action'},
  ];
  if (intent.peopleRequired.length || intent.companiesRequired.length) steps.splice(2, 0, {purpose: 'Verify candidate entities and provenance'});
  if (requirements.some((requirement) => requirement.key === 'budget')) steps.splice(2, 0, {purpose: 'Check budget feasibility and execution economics'});
  if (intent.goal) steps.push({purpose: 'Prepare contextual outreach draft', requiresApproval: true});

  return steps.map((step, index) => ({
    id: `nexus-step-${index + 1}`,
    purpose: step.purpose,
    agent: selectAgent(intent, step.purpose, agents),
    dependsOn: index === 0 ? [] : [`nexus-step-${index}`],
    approval: step.requiresApproval || actionRequiresApproval(step.purpose),
  }));
}

export class NexusRuntime {
  private readonly agents: AgentRegistry;
  private readonly now: () => number;

  constructor(options: NexusRuntimeOptions = {}) {
    this.agents = options.agents ?? new AgentRegistry();
    this.now = options.now ?? Date.now;
  }

  plan(rawOrIntent: string | GoalIntent): NexusPlanResult {
    const intent = typeof rawOrIntent === 'string' ? parseGoalIntent(rawOrIntent, this.now()) : rawOrIntent;
    const requirements = buildRequirements(intent);
    const unresolved: string[] = [];
    if (!intent.goal.trim()) unresolved.push('goal');
    if (intent.confidence < 0 || intent.confidence > 1) unresolved.push('confidence');

    const steps = buildSteps(intent, requirements, this.agents.list());
    const approvals = steps.filter((step) => step.approval).map((step) => ({
      id: `approval-${step.id}`,
      action: step.purpose,
      approver: 'user',
      status: 'pending' as const,
    }));

    return { intent, requirements, plan: {intentId: intent.id, steps}, approvals, unresolved };
  }

  execute(rawOrIntent: string | GoalIntent, approvals: ApprovalGate[] = []): NexusExecution {
    const plan = this.plan(rawOrIntent);
    if (plan.unresolved.length) return {plan, status: 'NEEDS_CLARIFICATION', steps: plan.plan.steps};

    const waiting = plan.approvals.some((required) => !isApproved(approvals.find((provided) => provided.id === required.id) ?? required));
    return {plan, status: waiting ? 'WAITING_APPROVAL' : 'READY', steps: plan.plan.steps};
  }
}

export const createNexusRuntime = (options?: NexusRuntimeOptions): NexusRuntime => new NexusRuntime(options);
