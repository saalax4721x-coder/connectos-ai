import type {ToolDefinition} from './tool'; export const toolAllowed=(tool:ToolDefinition,permissions:string[])=>tool.permissions.every(p=>permissions.includes(p));
