export interface RequirementConfidence {requirementId:string;confidence:number;source:string;}

export function isReliable(confidence:RequirementConfidence):boolean{
 return confidence.confidence>=0.7;
}
