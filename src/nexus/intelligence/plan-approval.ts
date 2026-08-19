export type ApprovalReason = 'external_action' | 'sensitive_data' | 'financial_commitment' | 'public_communication';
export interface PlanApproval { nodeId: string; reason: ApprovalReason; required: true; }
