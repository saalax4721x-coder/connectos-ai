export type MessageChannel='dm'|'email'|'connection-request'|'introduction'|'follow-up';
export interface DraftMessage{channel:MessageChannel;recipientId:string;body:string;contextIds:string[];requiresApproval:boolean;}
