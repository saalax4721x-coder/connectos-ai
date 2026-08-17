export interface RollbackAction{stepId:string;compensatingAction:string;executed:boolean;status:'pending'|'running'|'completed'|'failed';}
