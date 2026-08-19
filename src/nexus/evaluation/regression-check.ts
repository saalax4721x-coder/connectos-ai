export const isRegression=(previous:number,current:number,tolerance=.03)=>current<previous-tolerance;
