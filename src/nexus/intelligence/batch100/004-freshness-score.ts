export const freshnessScore=(ageHours:number, halfLife=72)=>Math.exp(-Math.max(0,ageHours)/halfLife);
