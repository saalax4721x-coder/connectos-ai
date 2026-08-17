import type {PlanLimits} from './plan'; export const featureAllowed=(limits:PlanLimits,feature:'deepResearch'|'customWorkflows')=>limits[feature];
