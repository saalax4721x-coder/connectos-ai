export const followupPriority=(value:number,urgency:number,daysLate:number)=>Math.min(1,.45*value+.35*urgency+.2*Math.min(1,daysLate/7));
