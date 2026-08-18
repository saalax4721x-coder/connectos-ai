export interface Reciprocity { given:number; received:number; }
export const reciprocityBalance=(r:Reciprocity)=>r.given+r.received===0?0.5:Math.min(1,r.given/(r.given+r.received));
