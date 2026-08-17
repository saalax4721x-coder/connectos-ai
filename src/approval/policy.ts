import type { Permission, AuthorizationContext } from '../core/permissions';
export interface ApprovalRequest { id:string; actorId:string; permission:Permission; reason:string; createdAt:string; status:'pending'|'approved'|'rejected'; }
export function requiresApproval(permission:Permission):boolean { return new Set<Permission>(['send-message','send-email','share-private-data','create-deal','financial-commitment']).has(permission); }
export function approve(request:ApprovalRequest,ctx:AuthorizationContext):ApprovalRequest { if(ctx.actorId!==request.actorId) throw new Error('approval actor mismatch'); return {...request,status:'approved'}; }
