export interface ContextBudget { maxFacts:number; maxTokens:number; }
export function trimFacts(facts:Record<string,unknown>, budget:ContextBudget):Record<string,unknown> { return Object.fromEntries(Object.entries(facts).slice(0,budget.maxFacts)); }
