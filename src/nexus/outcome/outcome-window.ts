export const withinOutcomeWindow=(at:string,days:number,now=Date.now())=>now-Date.parse(at)<=days*86400000;
