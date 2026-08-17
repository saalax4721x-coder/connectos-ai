export type NextAction='connect'|'message'|'request-introduction'|'collaborate'|'hire'|'partner'|'investigate'|'apply'|'save'|'follow'|'create-deal-room';
export interface NextBestAction{action:NextAction;reason:string;requiresApproval:boolean;confidence:number;}
