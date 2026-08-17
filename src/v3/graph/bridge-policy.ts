export const bridgeAllowed=(relationshipType:string,verified:boolean)=>verified&&!['private','blocked','unknown'].includes(relationshipType);
