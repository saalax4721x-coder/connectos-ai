import type {GraphRepository} from './repository'; import {shortestPath} from './path'; export const bridge=(g:GraphRepository,from:string,to:string)=>shortestPath(g,from,to,6);
