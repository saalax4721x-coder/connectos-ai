import type { GoalIntent } from './schema';

const match = (text: string, pattern: RegExp): string | undefined => text.match(pattern)?.[1]?.trim();

const singularize = (term: string): string => {
  if (term === 'people') return term;
  if (term.endsWith('ies')) return `${term.slice(0, -3)}y`;
  if (term.endsWith('s') && !term.endsWith('ss')) return term.slice(0, -1);
  return term;
};

export const baseIntent = (goal: string): GoalIntent => ({
  id: `intent-${Date.now()}`,
  raw: goal,
  goal,
  peopleRequired: [],
  companiesRequired: [],
  skillsRequired: [],
  constraints: [],
  preferences: [],
  confidence: goal.trim() ? 0.8 : 0,
});

export function parseGoalIntent(raw: string, now = Date.now()): GoalIntent {
  const text = raw.trim();
  const intent = baseIntent(text);
  intent.id = `intent-${now}`;

  intent.location = match(text, /\b(?:in|from|within|across)\s+([A-Za-z][A-Za-z .,'-]{1,48})(?=\s+(?:for|who|with|that|and|to|$))/i);
  intent.industry = match(text, /\b(?:in the|within the|for the)\s+([A-Za-z][A-Za-z &/-]{2,40})\s+(?:industry|sector|market)\b/i);

  const budgetMatch = text.match(/(?:budget|under|up to|max(?:imum)?)[^\d$]*(?:\$|USD\s*)?([\d,]+(?:\.\d+)?)(?:\s*(k|m|million|thousand))?/i);
  if (budgetMatch) {
    const value = Number(budgetMatch[1].replace(/,/g, ''));
    const suffix = budgetMatch[2]?.toLowerCase();
    intent.budget = suffix === 'k' || suffix === 'thousand' ? value * 1_000 : suffix === 'm' || suffix === 'million' ? value * 1_000_000 : value;
    intent.currency = /\$|USD/i.test(budgetMatch[0]) ? 'USD' : undefined;
  }

  intent.timeline = match(text, /\b(?:within|in|over)\s+(\d+\s*(?:days?|weeks?|months?|years?))\b/i);
  const urgency = text.match(/\b(critical|urgent|immediately|asap|high priority|this week|today)\b/i)?.[1]?.toLowerCase();
  intent.urgency = urgency ? (urgency === 'critical' || urgency === 'immediately' || urgency === 'asap' ? 'critical' : 'high') : undefined;

  const peopleTerms = ['investors?', 'clients?', 'customers?', 'distributors?', 'suppliers?', 'founders?', 'cofounders?', 'collaborators?', 'talent', 'partners?'];
  intent.peopleRequired = peopleTerms
    .filter((term) => new RegExp(`\\b${term}\\b`, 'i').test(text))
    .map((term) => singularize(term.replace(/\?$/, '')));
  const companyTerms = ['companies', 'startups', 'funds', 'agencies', 'manufacturers', 'studios', 'brands'];
  intent.companiesRequired = companyTerms.filter((term) => new RegExp(`\\b${term}\\b`, 'i').test(text)).map(singularize);

  const skillTerms = ['AI', 'engineering', 'marketing', 'sales', 'design', 'logistics', 'finance', 'legal', 'manufacturing'];
  intent.skillsRequired = skillTerms.filter((skill) => new RegExp(`\\b${skill}\\b`, 'i').test(text));
  return intent;
}
