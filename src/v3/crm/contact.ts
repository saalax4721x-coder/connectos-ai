export interface CRMContact{personId:string;tags:string[];relationshipStage:'new'|'known'|'active'|'trusted'|'dormant';lastInteractionAt?:string;nextFollowupAt?:string;notes:string[];}
