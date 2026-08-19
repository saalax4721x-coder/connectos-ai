export interface PlanEffort { minutes: number; credits: number; toolCalls: number; }
export function addEffort(a: PlanEffort, b: PlanEffort): PlanEffort { return {minutes:a.minutes+b.minutes, credits:a.credits+b.credits, toolCalls:a.toolCalls+b.toolCalls}; }
