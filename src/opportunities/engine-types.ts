import type { Provenance } from '../core/provenance';
import type { Opportunity, OpportunityType } from './types';
import type { OpportunitySignals, OpportunityScore } from './score';
import type { OpportunityStage } from './lifecycle';

export interface OpportunityEvidence {
  id: string;
  claim: string;
  observedAt: string;
  quality: number;
  provenance: Provenance[];
}

export interface OpportunityNextAction {
  id: string;
  title: string;
  rationale: string;
  prerequisites: string[];
  requiredPermission?: string;
  confidence: number;
  fallbackActions: string[];
  consequential: boolean;
}

export interface OpportunityRecord extends Opportunity {
  stage: OpportunityStage;
  status: 'active' | 'stale' | 'expired' | 'archived';
  evidence: OpportunityEvidence[];
  signals: OpportunitySignals;
  score: OpportunityScore;
  nextBestAction?: OpportunityNextAction;
  lastEvaluatedAt: string;
  expiresAt?: string;
  duplicateOf?: string;
  version: number;
}

export interface OpportunityCandidate {
  id?: string;
  type: OpportunityType;
  title: string;
  description: string;
  people?: string[];
  companies?: string[];
  location?: string;
  industry?: string;
  value?: number;
  currency?: string;
  urgency?: number;
  source: string;
  confidence: number;
  provenance: Provenance[];
  evidence: OpportunityEvidence[];
  signals: OpportunitySignals;
  rationale?: { whyYou?: string[]; whyThem?: string[]; whyNow?: string[] };
}
