export interface WorkflowRetryPolicy { maxAttempts:number; backoffMs:number; retryableStates:string[]; }
export const defaultWorkflowRetryPolicy:WorkflowRetryPolicy={maxAttempts:3,backoffMs:500,retryableStates:['transient_error','timeout']};
