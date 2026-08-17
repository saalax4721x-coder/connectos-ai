export type Permission='research'|'recommend'|'draft'|'send-message'|'send-email'|'share-private-data'|'create-deal'|'financial-commitment';
export interface AuthorizationContext { actorId:string; permissions:ReadonlySet<Permission>; consentVersion:string; }
export function can(ctx:AuthorizationContext, permission:Permission):boolean { return ctx.permissions.has(permission); }
export function requirePermission(ctx:AuthorizationContext, permission:Permission):void { if(!can(ctx,permission)) throw new Error(`approval required: ${permission}`); }
