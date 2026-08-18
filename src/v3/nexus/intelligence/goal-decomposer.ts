export interface GoalDecomposition { goal:string; requirements:string[]; constraints:string[]; successCriteria:string[]; }
export function decomposeGoal(goal:string):GoalDecomposition{return {goal,requirements:[],constraints:[],successCriteria:[]};}
