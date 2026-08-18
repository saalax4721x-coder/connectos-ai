export interface AgentRoute {agentId:string; capability:string; score:number; reason:string;}
export function rankRoutes(routes:AgentRoute[]):AgentRoute[]{return [...routes].sort((a,b)=>b.score-a.score);}
