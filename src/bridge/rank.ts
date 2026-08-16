import type {BridgePath} from './path';
export const rankBridgePaths=(paths:BridgePath[])=>paths.slice().sort((a,b)=>b.confidence*b.strength-a.confidence*a.strength);
