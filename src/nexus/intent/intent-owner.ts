export interface IntentOwner { intentId:string; userId:string; createdAt:string; }
export function ownsIntent(owner:IntentOwner, userId:string):boolean { return owner.userId === userId; }
