export type ListingCategory='talent'|'services'|'capital'|'projects'|'partnerships'|'consultants'|'agencies'|'suppliers'|'distributors'|'creators'|'experts';
export interface Listing{id:string;category:ListingCategory;title:string;ownerId:string;location?:string;skills:string[];budget?:number;verified:boolean;updatedAt:string;}
