export interface ClarificationRequest { missing:string[]; reason:string; }

export function needsClarification(missing:string[]):ClarificationRequest|null{
 if(missing.length===0) return null;
 return {missing,reason:'Additional context required'};
}
