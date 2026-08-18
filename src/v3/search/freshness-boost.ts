export const freshnessBoost=(base:number,freshness:number)=>base*(.7+.3*Math.max(0,Math.min(1,freshness)));
