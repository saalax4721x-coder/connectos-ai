export interface OpportunityFactors{relevance:number;fit:number;timing:number;access:number;value:number;urgency:number;competition:number;effort:number;risk:number;confidence:number;}
export const bounded=(n:number)=>Math.max(0,Math.min(1,n));
