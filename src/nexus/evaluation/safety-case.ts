export interface SafetyCase { id: string; prohibited: string[]; requiredApprovals: string[]; }
export function requiresApproval(action:string, safetyCase:SafetyCase): boolean { return safetyCase.requiredApprovals.includes(action); }
