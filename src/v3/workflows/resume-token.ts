export interface ResumeToken { workflowId:string; checkpointId:string; issuedAt:string; }
export const canResume=(t:ResumeToken)=>Boolean(t.workflowId&&t.checkpointId);
