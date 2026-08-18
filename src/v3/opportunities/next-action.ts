export type OpportunityAction='connect'|'message'|'intro'|'research'|'save'|'deal-room';
export interface NextAction { action:OpportunityAction; reason:string; confidence:number; }
