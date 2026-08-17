export const remainingMs=(deadline:number,now=Date.now())=>Math.max(0,deadline-now);
export const expired=(deadline:number,now=Date.now())=>now>=deadline;
