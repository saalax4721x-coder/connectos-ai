export interface ApprovalEvent { workflowId:string; gateId:string; decision:'approved'|'rejected'; actorId:string; timestamp:string; }
