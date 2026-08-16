export interface AutopilotGoal{id:string;userId:string;statement:string;targetOutcome:string;deadline?:string;approved:boolean;status:'draft'|'running'|'paused'|'completed';}
