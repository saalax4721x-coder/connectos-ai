export interface IdempotencyRecord { key:string; resultHash:string; createdAt:string; }
export const sameRequest=(a:IdempotencyRecord,b:IdempotencyRecord)=>a.key===b.key&&a.resultHash===b.resultHash;
