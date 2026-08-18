export interface BranchCondition { field:string; equals?:string; exists?:boolean; }
export function matchesBranch(value:unknown,c:BranchCondition):boolean{return c.exists!==undefined?Boolean(value)===c.exists:c.equals===undefined||String(value)===c.equals;}
