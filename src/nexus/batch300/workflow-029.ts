export interface WorkflowRetry { maxAttempts:number; backoffMs:number; retryableErrors:string[]; }
