import type {Memory} from './memory'; export const eligibleForAgent=(m:Memory,allowed:Memory['kind'][])=>allowed.includes(m.kind)&&m.confidence>=.5;
