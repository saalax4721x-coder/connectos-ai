export type AccessLevel='direct'|'warm'|'community'|'public'|'unknown';
export const accessRank=(a:AccessLevel)=>({direct:1,warm:.9,community:.7,public:.5,unknown:.2}[a]);
