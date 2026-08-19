export interface LatencySample { operation:string; durationMs:number; timestamp:string; }
export function latencySample(operation:string, durationMs:number): LatencySample { return {operation,durationMs,timestamp:new Date().toISOString()}; }
