export const relevance=(fit:number,need:number)=>Math.max(0,Math.min(1,fit*.6+need*.4));
