export interface Alert{id:string;userId:string;name:string;query:string;frequency:'instant'|'daily'|'weekly';enabled:boolean;lastRunAt?:string;}
