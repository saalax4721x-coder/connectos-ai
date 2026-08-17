import type {Intent} from './intent'; export const readyForExecution=(i:Intent)=>i.status==='ready'&&i.confidence>=.7&&i.requirements.every(r=>!r.required||r.confidence>=.6);
