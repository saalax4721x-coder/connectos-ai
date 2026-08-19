export interface OutcomeFeedback { workflowId:string; rating:number; reason?:string; createdAt:string; }
export function normalizeRating(rating:number):number { return Math.max(0,Math.min(1,rating)); }
