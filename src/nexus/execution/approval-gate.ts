export interface ApprovalGate { id: string; action: string; approver: string; status: 'pending' | 'approved' | 'rejected'; }
export function isApproved(gate: ApprovalGate): boolean { return gate.status === 'approved'; }
