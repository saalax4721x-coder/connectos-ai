export interface MemoryScore { relevance:number; recency:number; confidence:number; }
export const scoreMemory=(m:MemoryScore)=>m.relevance*.5+m.recency*.2+m.confidence*.3;
