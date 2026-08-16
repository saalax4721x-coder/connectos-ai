export interface Clarification{question:string;field:string;reason:string;priority:number;}
export const needsClarification=(confidence:number)=>confidence<0.65;
