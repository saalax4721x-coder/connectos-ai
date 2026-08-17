import type {SignalType} from './signal-type'; export interface Signal{id:string;type:SignalType;entityId:string;summary:string;observedAt:string;sourceIds:string[];confidence:number;impact:number;}
