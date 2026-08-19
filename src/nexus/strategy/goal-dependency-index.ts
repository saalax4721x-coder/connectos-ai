export function indexDependencies(items:{from:string,to:string}[]){return new Map(items.map(x=>[x.from,x.to]));}
