export const scopeAllowed=(granted:string[],requested:string[])=>requested.every(s=>granted.includes(s));
