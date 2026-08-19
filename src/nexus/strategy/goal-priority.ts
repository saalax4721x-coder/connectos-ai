export function scoreGoalPriority(urgency:number,value:number,confidence:number){return Math.max(0,Math.min(1,urgency*.4+value*.4+confidence*.2));}
