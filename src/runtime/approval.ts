export type ApprovalKind='message'|'email'|'deal'|'data-share'|'financial-action';
export interface ApprovalRequest{id:string;kind:ApprovalKind;summary:string;required:true;}
