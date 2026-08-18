export type ApprovalScope='research'|'draft'|'send'|'share'|'financial';
export const consequential=(s:ApprovalScope)=>s!=='research'&&s!=='draft';
