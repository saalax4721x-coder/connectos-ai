import type {NodeKind} from './node-kind'; export interface GraphQuery{startIds?:string[];kinds?:NodeKind[];edgeKinds?:string[];maxDepth?:number;limit?:number;}
