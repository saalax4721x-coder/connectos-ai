export interface RegressionResult{caseId:string;before:number;after:number;delta:number;passed:boolean;}
export const regressionPass=(delta:number)=>delta>=0;
