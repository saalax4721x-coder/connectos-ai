export const memoryFreshness=(updatedAt:string,halfLifeDays=30,now=Date.now())=>Math.exp(-Math.max(0,now-Date.parse(updatedAt))/(halfLifeDays*86400000));
