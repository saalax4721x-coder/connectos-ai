export interface ToolDefinition{id:string;name:string;description:string;inputSchema:string;outputSchema:string;permissions:string[];sideEffect:'none'|'read'|'write'|'external';}
