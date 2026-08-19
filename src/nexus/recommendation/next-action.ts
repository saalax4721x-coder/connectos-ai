export type NextAction='connect'|'message'|'request_introduction'|'collaborate'|'hire'|'partner'|'investigate'|'save'|'follow'|'create_deal_room';
export interface NextActionRecommendation { action:NextAction; reason:string; confidence:number; }
