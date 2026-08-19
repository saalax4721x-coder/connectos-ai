export interface PrivateDataPolicy { field:string; allowedScopes:string[]; }
export function canExpose(policy:PrivateDataPolicy, scope:string):boolean { return policy.allowedScopes.includes(scope); }
