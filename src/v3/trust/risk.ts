export type RiskLevel='low-concern'|'needs-verification'|'insufficient-information'; export interface RiskAssessment{level:RiskLevel;reasons:string[];sourceIds:string[];confidence:number;}
