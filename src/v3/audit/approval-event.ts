export interface ApprovalAuditEvent { approvalId:string; actor:string; scope:string; decision:'approved'|'rejected'; occurredAt:string; }
