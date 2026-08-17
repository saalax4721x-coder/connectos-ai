export type Visibility='private'|'team'|'connections'|'public'; export const canExpose=(visibility:Visibility,scope:Visibility)=>visibility==='public'||visibility===scope||scope==='private';
