export const idempotencyKey=(workflowId:string,stepId:string,inputHash:string)=>`${workflowId}:${stepId}:${inputHash}`;
