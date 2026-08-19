export const resolveByConfidence=(items:{value:unknown,confidence:number}[])=>items.reduce((a,b)=>b.confidence>a.confidence?b:a);
