import type {Intent} from '../intent/intent';
import type {IntentPlan} from '../intent/plan';
export interface Nexus{plan(intent:Intent):IntentPlan;}
