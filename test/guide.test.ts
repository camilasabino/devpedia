import { describe, expect, it } from 'vitest';
import { ContentIndex } from '../src/lib/content-model';
import { formatMonthYear, guideSequence, readingMinutes, tocEntries } from '../src/lib/guide';
import { loadModel } from './real-content';

const index = new ContentIndex(loadModel());
const ids = (lang: 'es' | 'en', guideId: string) => {
  const { previous, next, position, total } = guideSequence(index, lang, guideId);
  return { previous: previous?.id, next: next?.id, position, total };
};

describe('guideSequence', () => {
  it('follows the hub order of a subtopic: declared sections first, then order', () => {
    // Claude Code's `getting-started` section holds orders 1, 2, 3 and 12, so the
    // guide with order 12 is fourth and leads into the next section.
    expect(ids('en', 'claude-code-getting-started-in-a-repository')).toEqual({
      previous: 'claude-code-commands-and-shortcuts',
      next: 'claude-code-memory-and-context',
      position: 4,
      total: 12,
    });
  });

  it('omits the missing side at both ends and never wraps around', () => {
    const first = ids('es', 'what-is-claude-code');
    expect(first.previous).toBeUndefined();
    expect(first.position).toBe(1);

    const last = ids('es', 'spec-driven-development');
    expect(last.next).toBeUndefined();
    expect(last.position).toBe(last.total);
  });

  it('puts sectionless guides first', () => {
    expect(ids('en', 'what-are-design-patterns').position).toBe(1);
  });

  it('stays inside the parent: a subtopic never leads into its topic or a sibling subtopic', () => {
    for (const lang of ['es', 'en'] as const) {
      for (const guide of index.model[lang].guides) {
        const { previous, next, position, total } = guideSequence(index, lang, guide.id);
        for (const neighbor of [previous, next]) {
          if (!neighbor) continue;
          expect(neighbor.topic).toBe(guide.topic);
          expect(neighbor.subtopic).toBe(guide.subtopic);
        }
        expect(total).toBe(index.guidesOf(lang, guide.topic, guide.subtopic).length);
        expect(position).toBeGreaterThanOrEqual(1);
        expect(position).toBeLessThanOrEqual(total);
      }
    }
  });

  it('gives both editions the same sequence', () => {
    for (const guide of index.model.es.guides) {
      const es = ids('es', guide.id);
      const en = ids('en', guide.id);
      expect(en, guide.id).toEqual(es);
    }
  });
});

describe('readingMinutes', () => {
  it('reads prose at a fixed rate and never goes below one minute', () => {
    expect(readingMinutes('')).toBe(1);
    expect(readingMinutes('word '.repeat(165 * 4))).toBe(4);
  });

  it('counts Java lines and diagrams at their own rates instead of as prose', () => {
    const java = '```java\n' + 'int x = 1;\n'.repeat(25) + '```';
    expect(readingMinutes(java)).toBe(2);
    const diagrams = '<MermaidDiagram caption="a" code={`graph TD; A-->B`} />\n'.repeat(10);
    expect(readingMinutes(diagrams)).toBe(3);
  });
});

describe('formatMonthYear', () => {
  const date = new Date('2026-09-28T00:00:00Z');

  it('uses each edition locale', () => {
    expect(formatMonthYear(date, 'en')).toBe('Sep 2026');
    expect(formatMonthYear(date, 'es')).toMatch(/^sept? 2026$/);
  });

  it('reads dates in UTC, so a first-of-month date keeps its month', () => {
    expect(formatMonthYear(new Date('2026-03-01T00:00:00Z'), 'en')).toBe('Mar 2026');
  });
});

describe('tocEntries', () => {
  const h = (depth: number, slug: string) => ({ depth, slug, text: slug });

  it('keeps sections and subsections only', () => {
    expect(tocEntries([h(2, 'a'), h(3, 'b'), h(4, 'c'), h(2, 'd')]).map((e) => e.slug)).toEqual(['a', 'b', 'd']);
  });

  it('is empty when there is too little to navigate', () => {
    expect(tocEntries([])).toEqual([]);
    expect(tocEntries([h(2, 'only'), h(4, 'deep')])).toEqual([]);
  });
});
