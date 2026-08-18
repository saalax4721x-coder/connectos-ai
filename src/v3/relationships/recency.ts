export const recencyScore=(ageDays:number,halfLife=90)=>Math.pow(.5,ageDays/halfLife);
