import type {ToolDescriptor} from './tool';
export const permittedTools=(tools:ToolDescriptor[],permission:string)=>tools.filter(t=>t.permissions.includes(permission));
