import type {GoalIntent} from '../intent/schema';
import type {Opportunity} from '../opportunities/types';
import {scoreOpportunity, type OpportunitySignals} from '../opportunities/score';

export interface RankedOpportunity {
  opportunity: Opportunity;
  score: ReturnType<typeof scoreOpportunity>;
}

export function rankOpportunities(intent: GoalIntent, candidates: Array<{opportunity: Opportunity; signals: OpportunitySignals}>): RankedOpportunity[] {
  return candidates
    .map(({opportunity, signals}) => ({opportunity, score: scoreOpportunity(signals)}))
    .filter(({score}) => score.total > 0)
    .sort((a, b) => b.score.total - a.score.total)
    .map((entry) => {
      const locationMatch = !intent.location || entry.opportunity.location?.toLowerCase() === intent.location.toLowerCase();
      const industryMatch = !intent.industry || entry.opportunity.industry?.toLowerCase() === intent.industry.toLowerCase();
      if (!locationMatch || !industryMatch) entry.score.reasons.push('candidate does not fully match explicit intent constraints');
      return entry;
    });
}
