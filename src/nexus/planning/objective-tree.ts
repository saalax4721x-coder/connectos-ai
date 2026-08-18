export interface ObjectiveNode {
  id: string;
  objective: string;
  children: ObjectiveNode[];
}

export function createObjectiveNode(id:string, objective:string): ObjectiveNode {
  return { id, objective, children: [] };
}
