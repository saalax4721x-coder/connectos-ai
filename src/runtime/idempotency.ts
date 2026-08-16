export interface IdempotencyRecord{key:string;operation:string;createdAt:string;resultRef?:string;}
export const idempotencyKey=(scope:string,id:string)=>`${scope}:${id}`;
