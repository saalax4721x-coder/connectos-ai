export type FailureClass='transient'|'permanent'|'permission'|'validation'|'unknown';
export const retryableFailure=(f:FailureClass)=>f==='transient';
