import type {Relationship} from './relationship'; export const rankNeighbors=(edges:Relationship[])=>[...edges].sort((a,b)=>b.strength-a.strength);
