export function dependenciesSatisfied(dependencies:string[],completed:Set<string>):boolean{return dependencies.every(id=>completed.has(id));}
