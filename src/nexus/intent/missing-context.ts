export interface MissingContext { field:string; blocking:boolean; reason:string; }
export function isBlockingMissingContext(item:MissingContext):boolean{return item.blocking;}
