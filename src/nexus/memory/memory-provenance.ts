export interface MemoryProvenance { source: string; capturedAt: string; verifiedAt?: string; confidence: number; }
export function memoryProvenance(source:string, confidence:number): MemoryProvenance { return {source,confidence:Math.max(0,Math.min(1,confidence)),capturedAt:new Date().toISOString()}; }
