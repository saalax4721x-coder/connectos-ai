export interface Ambiguity{field:string;question:string;options?:string[];blocking:boolean;}
export const blockingAmbiguities=(items:Ambiguity[])=>items.filter(x=>x.blocking);
