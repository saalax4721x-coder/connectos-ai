import type {Relationship} from './relationship'; export const pathScore=(edges:Relationship[])=>edges.length?edges.reduce((s,e)=>s*e.strength,1)/edges.length:0;
