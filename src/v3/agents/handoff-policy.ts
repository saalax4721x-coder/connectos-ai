export interface HandoffPolicy { allowedDomains:string[]; requireReason:boolean; }
export const permitsDomain=(p:HandoffPolicy,domain:string)=>p.allowedDomains.includes(domain);
