export const feasibility=(resources:number,dependencies:number,constraints:number)=>Math.max(0,Math.min(1,resources*.4+dependencies*.3+constraints*.3));
