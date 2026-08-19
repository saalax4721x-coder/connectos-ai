export interface ParallelGroup { id:string; taskIds:string[]; join:'all'|'any'; }
export function groupReady(group:ParallelGroup, completed:Set<string>):boolean { return group.join === 'all' ? group.taskIds.every(id=>completed.has(id)) : group.taskIds.some(id=>completed.has(id)); }
