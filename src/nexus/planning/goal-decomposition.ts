export interface GoalNode {
  id: string;
  description: string;
  children: GoalNode[];
}

export function addSubGoal(parent: GoalNode, child: GoalNode): GoalNode {
  return { ...parent, children: [...parent.children, child] };
}
