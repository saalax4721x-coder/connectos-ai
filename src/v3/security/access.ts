export const hasAccess=(permissions:string[],required:string)=>permissions.includes('*')||permissions.includes(required);
