export interface SharedContext { projects:string[]; companies:string[]; interests:string[]; events:string[]; }
export const sharedContextCount=(c:SharedContext)=>Object.values(c).reduce((n,v)=>n+v.length,0);
