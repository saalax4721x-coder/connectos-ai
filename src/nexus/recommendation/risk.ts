export const risk=(uncertainty:number,privacy:number,consequence:number)=>Math.max(0,Math.min(1,uncertainty*.35+privacy*.3+consequence*.35));
