import type {Memory} from './memory'; export const activeMemory=(m:Memory,now=Date.now())=>!m.expiresAt||new Date(m.expiresAt).getTime()>now;
