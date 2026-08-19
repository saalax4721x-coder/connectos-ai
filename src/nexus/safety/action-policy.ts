export type ActionRisk = 'research'|'recommend'|'draft'|'external';
export interface ActionPolicy { risk:ActionRisk; requiresApproval:boolean; }
export const defaultActionPolicy: Record<ActionRisk, ActionPolicy> = {research:{risk:'research',requiresApproval:false},recommend:{risk:'recommend',requiresApproval:false},draft:{risk:'draft',requiresApproval:false},external:{risk:'external',requiresApproval:true}};
