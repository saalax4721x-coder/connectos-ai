export interface ToolResult<T=unknown> { callId:string; ok:boolean; data?:T; errorCode?:string; source?:string; }
