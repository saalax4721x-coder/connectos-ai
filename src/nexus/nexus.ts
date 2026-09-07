import type {Intent} from '../intent/intent';
import type {IntentPlan} from '../intent/plan';
import {createNexusRuntime, type NexusExecution, type NexusRuntime} from './runtime';

export interface Nexus {
  plan(intent: Intent): IntentPlan;
  execute(intent: Intent): NexusExecution;
}

export class DefaultNexus implements Nexus {
  constructor(private readonly runtime: NexusRuntime = createNexusRuntime()) {}

  plan(intent: Intent): IntentPlan {
    return this.runtime.plan({
      id: `intent-${Date.now()}`,
      raw: intent.goal,
      goal: intent.goal,
      outcome: intent.outcome,
      urgency: intent.urgency === 'critical' ? 'critical' : intent.urgency === 'high' ? 'high' : intent.urgency === 'medium' ? 'medium' : intent.urgency === 'low' ? 'low' : undefined,
      location: intent.location,
      industry: intent.industry,
      peopleRequired: intent.peopleTypes,
      companiesRequired: intent.companyTypes,
      skillsRequired: intent.skills,
      constraints: intent.constraints,
      preferences: intent.preferences,
      confidence: intent.confidence,
    }).plan;
  }

  execute(intent: Intent): NexusExecution {
    return this.runtime.execute({
      id: `intent-${Date.now()}`,
      raw: intent.goal,
      goal: intent.goal,
      outcome: intent.outcome,
      urgency: intent.urgency === 'critical' ? 'critical' : intent.urgency === 'high' ? 'high' : intent.urgency === 'medium' ? 'medium' : intent.urgency === 'low' ? 'low' : undefined,
      location: intent.location,
      industry: intent.industry,
      peopleRequired: intent.peopleTypes,
      companiesRequired: intent.companyTypes,
      skillsRequired: intent.skills,
      constraints: intent.constraints,
      preferences: intent.preferences,
      confidence: intent.confidence,
    });
  }
}
