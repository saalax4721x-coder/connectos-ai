export const signalPriority = (weight:number, freshness:number) => weight * Math.max(0, Math.min(1, freshness));
