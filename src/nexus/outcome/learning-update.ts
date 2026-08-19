export const updateWeight=(weight:number,signal:number,rate=.1)=>weight+rate*(signal-weight);
