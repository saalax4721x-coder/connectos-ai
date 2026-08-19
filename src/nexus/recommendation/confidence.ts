export const confidence=(source:number,evidence:number,agreement:number)=>Math.max(0,Math.min(1,source*.4+evidence*.4+agreement*.2));
