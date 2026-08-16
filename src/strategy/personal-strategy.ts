export interface PersonalStrategy{goal:string;horizonDays:number;actions:NextStrategyAction[];createdAt:string;requiresApproval:boolean;}
export interface NextStrategyAction{rank:number;action:string;targetIds:string[];reason:string;}
