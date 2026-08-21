import type { Goal, Intent, Provenance } from '../domain/types';
import type { NexusPlan } from './planner';

export interface NexusContext {
  id: string;
  userId: string;
  intent: Intent;
  rootGoal: Goal;
  plan?: NexusPlan;
  memoryScope: string[];
  permissions: string[];
  provenance: Provenance;
  createdAt: string;
  updatedAt: string;
}

export function createNexusContext(userId: string, intent: Intent, now = new Date().toISOString()): NexusContext {
  return {
    id: `nexus-${intent.id}`,
    userId,
    intent,
    rootGoal: {
      id: `goal-${intent.id}`,
      title: intent.goal.value,
      description: intent.goal.value,
      childGoalIds: [],
      dependencies: [],
      risks: [],
      priority: 50,
      status: 'UNDERSTOOD',
      confidence: intent.provenance.confidence,
    },
    memoryScope: [`user:${userId}`, `intent:${intent.id}`],
    permissions: ['research', 'analyze', 'recommend', 'draft'],
    provenance: intent.provenance,
    createdAt: now,
    updatedAt: now,
  };
}
