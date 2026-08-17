export interface Lease{id:string;owner:string;expiresAt:number}
export const validLease=(lease:Lease,now=Date.now())=>lease.expiresAt>now;
