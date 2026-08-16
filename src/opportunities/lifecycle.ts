export const opportunityStages=['discovered','researched','saved','qualified','contacted','conversation','meeting','proposal','negotiation','collaboration','deal','completed','outcome'] as const;
export type OpportunityStage=typeof opportunityStages[number];
