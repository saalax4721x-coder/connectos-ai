export type StopReason='success'|'budget'|'timeout'|'safety'|'failure';
export const shouldStop=(reason?:StopReason)=>Boolean(reason);
