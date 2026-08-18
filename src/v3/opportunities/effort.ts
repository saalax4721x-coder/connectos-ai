export interface OpportunityEffort { research:number; outreach:number; coordination:number; }
export const totalEffort=(e:OpportunityEffort)=>e.research+e.outreach+e.coordination;
