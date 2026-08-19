export const hasDependency=(id:string,deps:Record<string,string[]>)=>Boolean(deps[id]?.length);
