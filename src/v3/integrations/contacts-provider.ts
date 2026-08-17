export interface ContactsProvider{list(userId:string):Promise<{id:string;displayName:string;email?:string;company?:string}[]>;}
