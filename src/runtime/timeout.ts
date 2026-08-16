export interface TimeoutPolicy{timeoutMs:number;cancelOnTimeout:boolean;}
export const workflowTimeout:TimeoutPolicy={timeoutMs:30000,cancelOnTimeout:true};
