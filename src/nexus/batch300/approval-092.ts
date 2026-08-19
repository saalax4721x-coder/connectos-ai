export interface ApprovalDecision { requestId:string; decision:'approved'|'rejected'|'expired'; decidedBy:string; decidedAt:string; }
