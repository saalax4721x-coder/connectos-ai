export const requiresApproval=(kind:string,sensitive:boolean)=>sensitive||kind==='execute';
