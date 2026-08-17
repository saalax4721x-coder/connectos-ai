export interface ExecutionContext { runId:string; userId:string; tenantId?:string; traceId:string; permissions:string[]; locale?:string; metadata:Record<string,unknown>; }
export const hasPermission=(ctx:ExecutionContext, permission:string)=>ctx.permissions.includes(permission);
