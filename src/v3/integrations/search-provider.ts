export interface SearchProvider{ id:string;search(query:string,options?:Record<string,unknown>):Promise<{title:string;uri:string;snippet:string}[]>; }
