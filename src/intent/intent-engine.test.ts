import {describe,expect,it} from 'vitest';
import {analyzeIntent} from './intent-engine';

describe('intent intelligence',()=>{
 it('extracts actionable commercial intent',()=>{
  const result=analyzeIntent('Find AI startups in London with investors under $2m within 30 days');
  expect(result.intent.location).toContain('London');
  expect(result.intent.budget).toBe(2_000_000);
  expect(result.intent.timeline).toBe('30 days');
  expect(result.intent.companiesRequired).toContain('startups');
  expect(result.intent.peopleRequired).toContain('investor');
 });
 it('asks for a missing outcome',()=>{
  const result=analyzeIntent('Find qualified founders urgently');
  expect(result.intent.urgency).toBe('critical');
  expect(result.clarifications.some(q=>q.field==='outcome')).toBe(true);
 });
 it('does not mark an empty request ready',()=>{
  expect(analyzeIntent('').ready).toBe(false);
 });
});
