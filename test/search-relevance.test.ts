import { describe, expect, it } from 'vitest';
import { pagefindResultMatchesQuery, termMatchesCandidate } from '../src/lib/search-relevance';

describe('termMatchesCandidate', () => {
  it('keeps prefix matches while the query is still being typed', () => {
    expect(termMatchesCandidate('hel', 'helado')).toBe(true);
    expect(termMatchesCandidate('helad', 'helado')).toBe(true);
  });

  it('keeps exact and near-length variants', () => {
    expect(termMatchesCandidate('helado', 'helado')).toBe(true);
    expect(termMatchesCandidate('diagrama', 'diagramas')).toBe(true);
    expect(termMatchesCandidate('patrones', 'patron')).toBe(true);
  });

  it('rejects a long query that only shares a short prefix', () => {
    expect(termMatchesCandidate('helicoptero', 'helado')).toBe(false);
  });
});

describe('pagefindResultMatchesQuery', () => {
  const heladoHit = {
    meta: { title: '¿Qué es el Testing?' },
    excerpt: 'el “cono de <mark>helado</mark>”: pocos unit tests',
  };

  it('drops Pagefind prefix fallbacks like helicoptero → helado', () => {
    expect(pagefindResultMatchesQuery('helicoptero', heladoHit)).toBe(false);
  });

  it('keeps the same hit when the query is actually helado', () => {
    expect(pagefindResultMatchesQuery('helado', heladoHit)).toBe(true);
  });

  it('keeps mermaid identifiers that contain the query stem', () => {
    expect(
      pagefindResultMatchesQuery('diagrama', {
        meta: { title: 'Resiliencia en Sistemas Distribuidos' },
        excerpt: 'Timeout: <mark>sequenceDiagram</mark> participant P',
        content: 'Timeout: sequenceDiagram participant P as Payment',
      }),
    ).toBe(true);
  });

  it('keeps title matches even if the excerpt window is different', () => {
    expect(
      pagefindResultMatchesQuery('testing', {
        meta: { title: '¿Qué es el Testing?' },
        excerpt: 'una suite que tarda cuarenta minutos',
      }),
    ).toBe(true);
  });
});
