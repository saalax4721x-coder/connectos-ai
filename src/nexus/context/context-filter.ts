import type { ContextEnvelope } from './context-envelope';
export function filterContext(context:ContextEnvelope, allowed:string[]):ContextEnvelope { const facts=Object.fromEntries(Object.entries(context.facts).filter(([key])=>allowed.includes(key))); return {...context,facts}; }
