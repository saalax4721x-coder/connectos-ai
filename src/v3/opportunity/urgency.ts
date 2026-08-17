export const urgencyDecay=(urgency:number,ageDays:number,halfLifeDays=7)=>Math.max(0,Math.min(1,urgency*Math.pow(.5,ageDays/halfLifeDays)));
