export interface WorkflowStep { id:string; capability:string; dependsOn:string[]; }
export interface WorkflowPlan { id:string; steps:WorkflowStep[]; }
export function readySteps(plan:WorkflowPlan,completed:Set<string>):WorkflowStep[]{return plan.steps.filter(s=>!completed.has(s.id)&&s.dependsOn.every(d=>completed.has(d)));}
