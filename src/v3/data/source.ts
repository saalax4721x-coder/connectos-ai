import type {SourceType} from './source-type'; export interface DataSource{id:string;type:SourceType;name:string;uri?:string;owner?:string;authorized:boolean;createdAt:string;}
