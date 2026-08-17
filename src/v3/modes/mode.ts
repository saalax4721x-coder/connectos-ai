export type ProductMode='career'|'business'|'investor'|'founder'|'creator'|'event'; export interface ModeContext{mode:ProductMode;goal:string;activeFilters:Record<string,string>;}
