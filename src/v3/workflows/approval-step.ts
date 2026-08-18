export type ApprovalStatus='pending'|'approved'|'rejected';
export interface ApprovalStep { id:string; action:string; status:ApprovalStatus; }
