export const freshnessScore=(ageDays:number,halfLife=30)=>Math.pow(.5,ageDays/halfLife);
