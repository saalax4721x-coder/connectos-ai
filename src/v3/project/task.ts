export interface ProjectTask{id:string;projectId:string;title:string;ownerId?:string;status:'todo'|'doing'|'blocked'|'done';dependsOn:string[];dueAt?:string;}
