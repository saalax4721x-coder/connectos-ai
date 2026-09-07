import type {GoalIntent} from '../../intent/schema';
import type {Opportunity} from '../../opportunities/types';
import type {OpportunitySignals} from '../../opportunities/score';

export interface OpportunityCandidate { opportunity: Opportunity; signals: OpportunitySignals; }

export interface NexusIntelligenceProvider {
  discoverOpportunities?(intent: GoalIntent): Promise<OpportunityCandidate[]>;
  findWarmPaths?(intent: GoalIntent): Promise<unknown[]>;
  research?(intent: GoalIntent): Promise<Readonly<Record<string, unknown>>>;
}

export interface NexusIntelligenceSnapshot {
  opportunities: OpportunityCandidate[];
  warmPaths: unknown[];
  research: Readonly<Record<string, unknown>>;
  capturedAt: number;
}

export const emptyIntelligenceSnapshot = (capturedAt: number): NexusIntelligenceSnapshot => ({
  opportunities: [],
  warmPaths: [],
  research: Object.freeze({}),
  capturedAt,
});
