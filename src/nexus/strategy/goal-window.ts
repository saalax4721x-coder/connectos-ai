export const daysUntil=(deadline:string,now=Date.now())=>Math.ceil((Date.parse(deadline)-now)/86400000);
