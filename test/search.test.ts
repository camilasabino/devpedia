import { describe, expect, it } from 'vitest';
import { ContentIndex } from '../src/lib/content-model';
import { searchContext } from '../src/lib/search';
import { loadModel } from './real-content';

const index = new ContentIndex(loadModel());
const context = (lang: 'es' | 'en', kind: 'topic' | 'subtopic' | 'guide', id: string) =>
  searchContext(index, lang, kind, id, lang === 'es' ? 'Tema' : 'Topic');

describe('searchContext', () => {
  it('names the topic and section of a guide that lives directly under its topic', () => {
    expect(context('en', 'guide', 'domain-driven-design')).toBe('Architecture › Domain and structure');
    expect(context('es', 'guide', 'domain-driven-design')).toBe('Arquitectura › Dominio y estructura');
  });

  it('names topic, subtopic and section of a guide under a subtopic', () => {
    expect(context('es', 'guide', 'state-pattern')).toBe('Diseño › Patrones › Patrones de comportamiento');
  });

  it('leaves out the levels a guide does not have', () => {
    // Design principles declares no sections; `what-are-design-patterns` has none.
    expect(context('en', 'guide', 'solid')).toBe('Design › Design principles');
    expect(context('en', 'guide', 'what-are-design-patterns')).toBe('Design › Design patterns');
  });

  it('does not repeat a section named like the guide itself', () => {
    expect(context('es', 'guide', 'creational-patterns')).toBe('Diseño › Patrones');
  });

  it('gives a subtopic its parent topic, and a topic the localized topic label', () => {
    expect(context('en', 'subtopic', 'claude-code')).toBe('AI Engineering');
    expect(context('es', 'topic', 'testing')).toBe('Tema');
    expect(context('en', 'topic', 'testing')).toBe('Topic');
  });

  it('builds a context for every guide and subtopic of both editions', () => {
    for (const lang of ['es', 'en'] as const) {
      for (const route of index.routes(lang)) {
        const value = context(lang, route.kind, route.id);
        expect(value, `${lang} ${route.kind} ${route.id}`).not.toBe('');
        expect(value).not.toMatch(/\//);
      }
    }
  });
});
