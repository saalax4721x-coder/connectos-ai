import type { ConfidenceLevel, Evidence, Intent, IntentField, Provenance, Requirement } from './types';
import { validateIntent } from './intent-validator';

export interface IntentInput {
  userId: string;
  text: string;
  source?: string;
  now?: string;
}

export interface IntentAnalysis {
  intent: Intent;
  missing: string[];
  clarificationNeeded: boolean;
  validation: ReturnType<typeof validateIntent>;
}

const confidenceFor = (explicit: boolean): ConfidenceLevel => explicit ? 'HIGH' : 'MEDIUM';

function field<T>(value: T, source: string, timestamp: string, explicit: boolean): IntentField<T> {
  const evidence: Evidence = {
    source,
    timestamp,
    description: explicit ? 'Explicitly supplied by the user' : 'Inferred from user language',
    verified: explicit,
  };
  return {
    value,
    confidence: confidenceFor(explicit),
    inferred: !explicit,
    verified: explicit,
    evidence: [evidence],
  };
}

function provenance(source: string, timestamp: string, confidence: ConfidenceLevel): Provenance {
  return { source, createdAt: timestamp, lastVerified: timestamp, confidence };
}

function extractCategory(text: string): string | undefined {
  const lower = text.toLowerCase();
  const categories: Array<[string, string]> = [
    ['investor', 'CAPITAL'], ['funding', 'CAPITAL'], ['client', 'CLIENT_ACQUISITION'],
    ['customer', 'CLIENT_ACQUISITION'], ['distributor', 'PARTNERSHIP'], ['supplier', 'SUPPLY'],
    ['cofounder', 'TALENT'], ['co-founder', 'TALENT'], ['job', 'CAREER'], ['hire', 'TALENT'],
    ['collaborator', 'COLLABORATION'], ['partner', 'PARTNERSHIP'],
  ];
  return categories.find(([term]) => lower.includes(term))?.[1];
}

function extractRequirements(text: string, source: string, timestamp: string): Requirement[] {
  const lower = text.toLowerCase();
  const requirements: Requirement[] = [];
  const location = lower.match(/\b(?:in|from|within)\s+([a-z][a-z .'-]{1,40})/i)?.[1]?.trim();
  if (location) requirements.push({
    id: `req-location-${timestamp}`,
    name: 'location', value: location,
    priority: 'PREFERRED', provenance: provenance(source, timestamp, 'MEDIUM'),
  });
  const quantity = lower.match(/\b(\d[\d,]*)\s+(?:units|customers|clients|investors|distributors|suppliers)\b/i)?.[1];
  if (quantity) requirements.push({
    id: `req-quantity-${timestamp}`,
    name: 'quantity', value: Number(quantity.replace(/,/g, '')),
    priority: 'MANDATORY', provenance: provenance(source, timestamp, 'HIGH'),
  });
  return requirements;
}

function missingFor(category: string | undefined, text: string): string[] {
  const lower = text.toLowerCase();
  const missing: string[] = [];
  if (category === 'CAPITAL' && !/\b(?:stage|seed|pre-seed|series [a-d]|amount|\$|million|million|funding)\b/i.test(lower)) missing.push('funding stage and target amount');
  if (category === 'CLIENT_ACQUISITION' && !/\b(?:industry|sector|budget|country|market)\b/i.test(lower)) missing.push('target market or customer profile');
  if (category === 'PARTNERSHIP' && !/\b(?:country|market|location|region)\b/i.test(lower)) missing.push('target geography');
  return missing;
}

export function analyzeIntent(input: IntentInput): IntentAnalysis {
  const now = input.now ?? new Date().toISOString();
  const source = input.source ?? 'user_input';
  const text = input.text.trim();
  const goalText = text || 'Unknown goal';
  const category = extractCategory(text);
  const missing = missingFor(category, text);
  const confidence = category ? 'MEDIUM' : 'LOW';
  const intent: Intent = {
    id: `intent-${input.userId}-${Date.parse(now) || now}`,
    userId: input.userId,
    goal: field(goalText, source, now, Boolean(text)),
    ...(category ? { category: field(category, source, now, false) } : {}),
    entities: [],
    requirements: extractRequirements(text, source, now),
    constraints: [],
    status: missing.length ? 'NEEDS_CLARIFICATION' : 'UNDERSTOOD',
    version: 1,
    provenance: provenance(source, now, confidence),
  };
  const validation = validateIntent(intent);
  if (!validation.valid) intent.status = 'NEEDS_CLARIFICATION';
  return { intent, missing, clarificationNeeded: missing.length > 0, validation };
}
