export const recencyScore=(lastInteraction:string,halfLifeDays=45,now=Date.now())=>Math.pow(.5,Math.max(0,now-new Date(lastInteraction).getTime())/(halfLifeDays*86400000));
