export const invariant=(condition:boolean,message:string)=>{if(!condition)throw new Error(`Invariant failed: ${message}`);}; export const bounded=(n:number)=>Math.max(0,Math.min(1,n));
