export type DataClass='public'|'professional'|'private'|'sensitive'; export const shareable=(c:DataClass,target:'public'|'team'|'user')=>c==='public'||(c==='professional'&&target!=='public');
