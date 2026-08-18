export interface NexusObjective {
  id: string;
  goalId: string;
  priority: number;
  successCriteria: string[];
  constraints: string[];
}

export function rankObjectives(objectives: NexusObjective[]): NexusObjective[] {
  return [...objectives].sort((a, b) => b.priority - a.priority);
}
