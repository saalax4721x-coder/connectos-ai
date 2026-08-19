export const requirementScore=(confidence:number,priority:number)=>Math.max(0,Math.min(1,confidence*priority));
