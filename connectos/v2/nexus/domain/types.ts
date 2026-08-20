export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Evidence {
  source: string;
  timestamp: string;
  description: string;
  verified: boolean;
}

export interface Provenance {
  source: string;
  createdAt: string;
  lastVerified?: string;
  confidence: ConfidenceLevel;
}

export interface IntentField<T> {
  value: T;
  confidence: ConfidenceLevel;
  inferred: boolean;
  verified: boolean;
  evidence: Evidence[];
}

export interface Requirement {
  id: string;
  name: string;
  value: unknown;
  priority: 'MANDATORY' | 'PREFERRED' | 'OPTIONAL' | 'UNKNOWN';
  provenance: Provenance;
}

export interface Intent {
  id: string;
  userId: string;
  goal: IntentField<string>;
  category?: IntentField<string>;
  entities: IntentField<string>[];
  requirements: Requirement[];
  constraints: Requirement[];
  timeline?: IntentField<string>;
  budget?: IntentField<number>;
  status: 'CREATED' | 'ANALYZING' | 'UNDERSTOOD' | 'NEEDS_CLARIFICATION' | 'READY';
  version: number;
  provenance: Provenance;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  parentGoalId?: string;
  childGoalIds: string[];
  priority: number;
  dependencies: string[];
  risks: string[];
  status: 'CREATED' | 'UNDERSTOOD' | 'PLANNED' | 'ACTIVE' | 'BLOCKED' | 'COMPLETED' | 'OUTCOME';
  confidence: ConfidenceLevel;
  outcome?: unknown;
}

export interface NexusContext {
  intent: Intent;
  goal: Goal;
  permissions: string[];
  memoryScope: string[];
  provenance: Provenance;
}
