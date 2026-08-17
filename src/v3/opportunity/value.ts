export interface ValueEstimate{currency:string;low?:number;expected?:number;high?:number;basis:string;confidence:number;}
export const expectedValue=(v:ValueEstimate)=>v.expected??((v.low??0)+(v.high??v.low??0))/2;
