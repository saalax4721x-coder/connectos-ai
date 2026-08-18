export interface NexusGoalContext {
  goal: string;
  objectives: string[];
  constraints: string[];
  signals: Record<string, unknown>;
}

export function createGoalContext(goal: string): NexusGoalContext {
  return { goal, objectives: [], constraints: [], signals: {} };
}
