export interface ConcurrencyLimit { max:number; active:number; }
export const canStart=(l:ConcurrencyLimit)=>l.active<l.max;
