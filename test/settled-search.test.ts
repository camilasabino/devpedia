import { describe, expect, it } from 'vitest';
import {
  clearPendingSearch,
  flushSettledSearch,
  initialSettledSearch,
  notePendingSearch,
  type SettledSearchState,
} from '@/components/search/settled-search';

function settle(state: SettledSearchState, query: string, resultCount: number) {
  return flushSettledSearch(notePendingSearch(state, query, resultCount));
}

describe('settled search reporting', () => {
  it('reports a settled query once, as a result count and not the query text', () => {
    const flushed = settle(initialSettledSearch(), 'arquitectura', 4);

    expect(flushed.report).toEqual({ resultCount: 4 });
    expect(JSON.stringify(flushed.report)).not.toContain('arquitectura');
    expect(flushSettledSearch(flushed.state).report).toBeNull();
  });

  it('reports an empty result set as zero', () => {
    expect(settle(initialSettledSearch(), 'helicoptero', 0).report).toEqual({ resultCount: 0 });
  });

  it('does not report the same query again, even with a different result count', () => {
    const first = settle(initialSettledSearch(), 'testing', 3);
    const again = settle(first.state, 'testing', 8);

    expect(first.report).toEqual({ resultCount: 3 });
    expect(again.report).toBeNull();
  });

  it('reports a new query, including a return to one that was already reported', () => {
    const first = settle(initialSettledSearch(), 'testing', 3);
    const second = settle(first.state, 'patrones', 2);
    const back = settle(second.state, 'testing', 3);

    expect(second.report).toEqual({ resultCount: 2 });
    expect(back.report).toEqual({ resultCount: 3 });
  });

  it('treats case and surrounding space as the same query, and keeps accents distinct', () => {
    const settled = settle(initialSettledSearch(), '  Foo ', 2);
    expect(settle(settled.state, 'foo', 2).report).toBeNull();

    const accented = settle(initialSettledSearch(), 'Árbol', 1);
    expect(settle(accented.state, 'arbol', 1).report).toEqual({ resultCount: 1 });
  });

  it('reports only the latest pending query and its latest result count', () => {
    const replaced = notePendingSearch(
      notePendingSearch(initialSettledSearch(), 'testing', 1),
      'patrones',
      5,
    );

    expect(flushSettledSearch(replaced).report).toEqual({ resultCount: 5 });
  });

  it('drops a pending query without reporting it or blocking the next one', () => {
    const pending = notePendingSearch(initialSettledSearch(), 'testing', 3);
    const cleared = flushSettledSearch(clearPendingSearch(pending));

    expect(cleared.report).toBeNull();
    expect(settle(cleared.state, 'testing', 3).report).toEqual({ resultCount: 3 });
  });
});
