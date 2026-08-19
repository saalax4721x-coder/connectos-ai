export interface WorkflowDependency { predecessor:string; successor:string; }
export function dependencyKey(d:WorkflowDependency):string { return `${d.predecessor}->${d.successor}`; }
