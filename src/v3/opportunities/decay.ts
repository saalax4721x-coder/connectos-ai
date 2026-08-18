export const decayScore=(score:number,ageDays:number,halfLifeDays:number)=>score*Math.pow(.5,ageDays/Math.max(1,halfLifeDays));
