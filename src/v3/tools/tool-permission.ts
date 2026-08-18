export type ToolPermission='read'|'write'|'external-send'|'financial';
export const requiresApproval=(p:ToolPermission)=>p==='external-send'||p==='financial';
