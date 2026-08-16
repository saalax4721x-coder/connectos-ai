export type Permission='read:profile'|'read:network'|'read:company'|'write:message'|'write:deal'|'share:private';
export const can=(permissions:Permission[],required:Permission)=>permissions.includes(required);
