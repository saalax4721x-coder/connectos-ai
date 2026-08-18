export type AgentWarningCode='low_confidence'|'stale_evidence'|'missing_source'|'permission_required';
export interface AgentWarning { code:AgentWarningCode; message:string; }
