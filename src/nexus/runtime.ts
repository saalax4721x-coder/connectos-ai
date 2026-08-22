import type {IntentPlan, IntentStep} from '../intent/plan';
import type {GoalIntent, IntentRequirement} from '../intent/schema';
import {parseGoalIntent} from '../intent/parser';
import {buildRequirements} from '../intent/requirements';
import type {AgentDefinition} from '../agents/agent';
import {AgentRegistry} from '../agents/registry';
import type {AgentContext} from '../agents/context';
import {RuntimeAgentRegistry} from '../agents/runtime-registry';
import {isApproved, type ApprovalGate} from './execution/approval-gate';
import {InMemoryNexusExecutionStateStore, type NexusExecutionStateStore} from './execution/state-store';
import {deriveNextAction, InMemoryNexusOutcomeRecorder, type NexusOutcomeRecorder} from './outcome';

export interface NexusPlanResult { intent: GoalIntent; requirements: IntentRequirement[]; plan: IntentPlan; approvals: ApprovalGate[]; unresolved: string[]; }
export interface NexusRuntimeOptions { agents?: AgentRegistry; runtimeAgents?: RuntimeAgentRegistry; now?: () => number; stateStore?: NexusExecutionStateStore; outcomeRecorder?: NexusOutcomeRecorder; maxRetries?: number; }
export interface NexusExecution { executionId: string; plan: NexusPlanResult; status: 'READY' | 'WAITING_APPROVAL' | 'NEEDS_CLARIFICATION'; steps: Array<IntentStep & {agent?: string}>; }
export interface NexusStepResult { stepId:string; status:'COMPLETED'|'WAITING_APPROVAL'|'UNASSIGNED'|'FAILED'; agent?:string; output?:unknown; error?:string; attempts?:number; }
export interface NexusRunResult { execution:NexusExecution; results:NexusStepResult[]; }

const actionRequiresApproval = (purpose: string): boolean => /\b(send|contact|publish|share|create deal|financial|commit|external)\b/i.test(purpose);

function selectAgent(intent: GoalIntent, purpose: string, agents: AgentDefinition[]): string | undefined {
  const terms = [purpose, intent.industry ?? '', ...intent.skillsRequired].join(' ').toLowerCase();
  return agents
    .filter((agent) => agent.status === 'active')
    .sort((a, b) => {
      const score = (agent: AgentDefinition) => agent.skills.reduce((sum, skill) => sum + (terms.includes(skill.toLowerCase()) ? 1 : 0), 0);
      return score(b) - score(a);
    })[0]?.id;
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
  private readonly runtimeAgents?: RuntimeAgentRegistry;
  private readonly now: () => number;
  private readonly stateStore: NexusExecutionStateStore;
  private readonly outcomeRecorder: NexusOutcomeRecorder;
  private readonly maxRetries: number;

  constructor(options: NexusRuntimeOptions = {}) {
    this.agents = options.agents ?? new AgentRegistry();
    this.runtimeAgents = options.runtimeAgents;
    this.now = options.now ?? Date.now;
    this.stateStore = options.stateStore ?? new InMemoryNexusExecutionStateStore();
    this.outcomeRecorder = options.outcomeRecorder ?? new InMemoryNexusOutcomeRecorder();
    this.maxRetries = Math.max(0, Math.floor(options.maxRetries ?? 1));
  }

  plan(rawOrIntent: string | GoalIntent): NexusPlanResult {
    const intent = typeof rawOrIntent === 'string' ? parseGoalIntent(rawOrIntent, this.now()) : rawOrIntent;
    const requirements = buildRequirements(intent);
    const unresolved: string[] = [];
    if (!intent.goal.trim()) unresolved.push('goal');
    if (intent.confidence < 0 || intent.confidence > 1) unresolved.push('confidence');
    const registered = this.runtimeAgents?.list() ?? [];
    const agents = registered.length ? registered : this.agents.list();
    const steps = buildSteps(intent, requirements, agents);
    const approvals = steps.filter((step) => step.approval).map((step) => ({id:`approval-${step.id}`,action:step.purpose,approver:'user',status:'pending' as const}));
    return {intent,requirements,plan:{intentId:intent.id,steps},approvals,unresolved};
  }

  execute(rawOrIntent: string | GoalIntent, approvals: ApprovalGate[] = []): NexusExecution {
    const plan = this.plan(rawOrIntent);
    const executionId = `nexus-execution-${plan.intent.id}`;
    if (plan.unresolved.length) {
      this.persistState(executionId, plan.intent.id, 'NEEDS_CLARIFICATION', [], [], plan.plan.steps.map((step) => step.id), {});
      return {executionId,plan,status:'NEEDS_CLARIFICATION',steps:plan.plan.steps};
    }
    const waiting = plan.approvals.some((required) => !isApproved(approvals.find((provided) => provided.id === required.id) ?? required));
    this.persistState(executionId, plan.intent.id, waiting ? 'WAITING_APPROVAL' : 'PLANNED', [], [], waiting ? plan.plan.steps.filter((step) => step.approval).map((step) => step.id) : [], {});
    return {executionId,plan,status:waiting ? 'WAITING_APPROVAL' : 'READY',steps:plan.plan.steps};
  }

  async run(rawOrIntent: string | GoalIntent, actorId: string, approvals: ApprovalGate[] = []): Promise<NexusRunResult> {
    const execution = this.execute(rawOrIntent, approvals);
    if (execution.status !== 'READY' || !this.runtimeAgents) {
      return {execution,results:execution.steps.map((step) => ({stepId:step.id,status:execution.status === 'WAITING_APPROVAL' ? 'WAITING_APPROVAL' : 'UNASSIGNED',agent:step.agent}))};
    }

    const executionState = this.stateStore.get(execution.executionId);
    const completed = new Set(executionState?.completedSteps ?? []);
    const failed: string[] = [];
    const waiting: string[] = [];
    const results: NexusStepResult[] = [];
    const outputs: Record<string, unknown> = {};
    const startedAt = this.now();
    this.persistState(execution.executionId, execution.plan.intent.id, 'RUNNING', [...completed], [], [], {actorId, startedAt});

    for (const step of execution.steps) {
      if (completed.has(step.id)) {
        results.push({stepId:step.id,status:'COMPLETED',agent:step.agent,attempts:0});
        continue;
      }
      if (step.dependsOn.some((dependency) => !completed.has(dependency))) {
        waiting.push(step.id);
        results.push({stepId:step.id,status:'WAITING_APPROVAL',agent:step.agent,error:'dependency not completed'});
        continue;
      }
      if (!step.agent) {
        failed.push(step.id);
        results.push({stepId:step.id,status:'UNASSIGNED'});
        continue;
      }
      const requiredApproval = execution.plan.approvals.find((approval) => approval.id === `approval-${step.id}`);
      if (step.approval && !isApproved(approvals.find((approval) => approval.id === requiredApproval?.id) ?? requiredApproval ?? {id:'',action:step.purpose,approver:'user',status:'pending'})) {
        waiting.push(step.id);
        results.push({stepId:step.id,status:'WAITING_APPROVAL',agent:step.agent});
        continue;
      }

      let lastError: string | undefined;
      let attempts = 0;
      while (attempts <= this.maxRetries) {
        attempts += 1;
        try {
          const context: AgentContext = {
            requestId: `${execution.plan.intent.id}:${step.id}`,
            actorId,
            goalId: execution.plan.intent.id,
            intentId: execution.plan.intent.id,
            facts: Object.freeze({intent:execution.plan.intent,requirements:execution.plan.requirements,previousOutputs:outputs}),
            constraints: Object.freeze(execution.plan.intent.constraints),
            approvals: Object.freeze(approvals.map((approval) => approval.id)),
            correlationId: execution.plan.intent.id,
          };
          const output = await this.runtimeAgents.resolve(step.agent).execute(context, {purpose:step.purpose});
          outputs[step.id] = output;
          completed.add(step.id);
          results.push({stepId:step.id,status:'COMPLETED',agent:step.agent,output,attempts});
          lastError = undefined;
          break;
        } catch (error) {
          lastError = error instanceof Error ? error.message : String(error);
        }
      }
      if (lastError) {
        failed.push(step.id);
        results.push({stepId:step.id,status:'FAILED',agent:step.agent,error:lastError,attempts});
        break;
      }
      this.persistState(execution.executionId, execution.plan.intent.id, 'RUNNING', [...completed], [...failed], [...waiting], {actorId,startedAt,outputs});
    }

    const status = failed.length ? (completed.size ? 'PARTIAL' : 'FAILED') : waiting.length ? 'PARTIAL' : 'COMPLETED';
    const completedIds = [...completed];
    const summary = failed.length ? `Execution stopped after ${failed.length} failed step(s).` : waiting.length ? `Execution paused with ${waiting.length} waiting step(s).` : `Execution completed ${completedIds.length} step(s).`;
    this.persistState(execution.executionId, execution.plan.intent.id, status, completedIds, [...failed], [...waiting], {actorId,startedAt,outputs}, this.now());
    this.outcomeRecorder.record({
      executionId: execution.executionId,
      status: status === 'COMPLETED' ? 'SUCCEEDED' : status === 'FAILED' ? 'FAILED' : 'PARTIAL',
      completedStepIds: completedIds,
      failedStepIds: [...failed],
      summary,
      nextAction: deriveNextAction(execution.plan.intent.goal, completedIds, failed),
      confidence: Math.max(0, Math.min(1, execution.plan.intent.confidence)),
      source: ['nexus-runtime'],
      recordedAt: this.now(),
    });
    return {execution,results};
  }

  getExecutionState(executionId: string) { return this.stateStore.get(executionId); }
  getOutcome(executionId: string) { return this.outcomeRecorder.get(executionId); }

  private persistState(executionId: string, intentId: string, status: 'PLANNED'|'NEEDS_CLARIFICATION'|'WAITING_APPROVAL'|'RUNNING'|'COMPLETED'|'PARTIAL'|'FAILED', completedSteps: string[], failedSteps: string[], waitingSteps: string[], metadata: Record<string, unknown>, completedAt?: number): void {
    this.stateStore.save({executionId,intentId,status,updatedAt:this.now(),startedAt:typeof metadata.startedAt === 'number' ? metadata.startedAt : undefined,completedAt,completedSteps,failedSteps,waitingSteps,metadata});
  }
}

export const createNexusRuntime = (options?: NexusRuntimeOptions): NexusRuntime => new NexusRuntime(options);
