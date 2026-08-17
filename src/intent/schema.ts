export type IntentValue=string|number|boolean|string[];
export interface GoalIntent { id:string; raw:string; goal:string; outcome?:string; urgency?:'low'|'medium'|'high'|'critical'; location?:string; industry?:string; peopleRequired:string[]; companiesRequired:string[]; skillsRequired:string[]; budget?:number; currency?:string; timeline?:string; constraints:string[]; preferences:string[]; confidence:number; }
export interface IntentRequirement { key:string; required:boolean; values:string[]; rationale:string; }
