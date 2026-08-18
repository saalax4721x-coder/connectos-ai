export interface TimeoutPolicy { stepMs:number; workflowMs:number; }
export const defaultTimeoutPolicy:TimeoutPolicy={stepMs:30000,workflowMs:300000};
