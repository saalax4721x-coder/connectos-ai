export const constraintPriority=(kind:'hard'|'soft',priority:number)=>kind==='hard'?1:Math.max(0,Math.min(1,priority));
