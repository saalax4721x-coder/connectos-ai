export type NexusAction = 'RESEARCH' | 'ANALYZE' | 'RECOMMEND' | 'DRAFT' | 'SEND_MESSAGE' | 'SEND_EMAIL' | 'PUBLISH' | 'SHARE_PRIVATE_DATA' | 'CREATE_DEAL' | 'FINANCIAL_COMMITMENT';

const consequential = new Set<NexusAction>([
  'SEND_MESSAGE', 'SEND_EMAIL', 'PUBLISH', 'SHARE_PRIVATE_DATA', 'CREATE_DEAL', 'FINANCIAL_COMMITMENT',
]);

export interface ApprovalDecision {
  required: boolean;
  reason?: string;
}

export function approvalFor(action: NexusAction): ApprovalDecision {
  if (!consequential.has(action)) return { required: false };
  return { required: true, reason: `User approval is required before ${action.toLowerCase().replace(/_/g, ' ')}` };
}
