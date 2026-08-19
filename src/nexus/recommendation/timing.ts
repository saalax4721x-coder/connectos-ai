export const timing=(urgency:number,recency:number)=>Math.max(0,Math.min(1,urgency*.7+recency*.3));
