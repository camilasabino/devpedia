import type { ContentIndex, GuideData, Lang } from './content-model';
import { groupBySection } from './hub';

/** Where a guide sits in the pedagogical sequence it belongs to. */
export interface GuideSequence {
  /** 1-based position of the guide in `guides`. */
  position: number;
  total: number;
  previous?: GuideData;
  next?: GuideData;
}

/**
 * The reading sequence of a guide: the guides of its direct parent (its subtopic when it
 * has one, else its topic), in the same order the parent's hub page lists them — the
 * declared sections in order, each sorted by `order`, sectionless guides first. The
 * sequence never crosses into another topic or subtopic, and it does not wrap around.
 */
export function guideSequence(index: ContentIndex, lang: Lang, guideId: string): GuideSequence {
  const guide = index.guide(lang, guideId);
  if (!guide) throw new Error(`No ${lang} guide "${guideId}"`);
  const owner = guide.subtopic ? index.subtopic(lang, guide.subtopic) : index.topic(lang, guide.topic);
  if (!owner) throw new Error(`No parent for ${lang} guide "${guideId}"`);

  const guides = groupBySection(owner, index.guidesOf(lang, guide.topic, guide.subtopic)).flatMap(
    (group) => group.guides,
  );
  const i = guides.findIndex((candidate) => candidate.id === guideId);
  return {
    position: i + 1,
    total: guides.length,
    previous: guides[i - 1],
    next: guides[i + 1],
  };
}

// Reading time = prose words / WPM + Java code lines / LPM + diagrams * DIAGRAM_SECONDS.
// Java lines and Mermaid source are removed from the prose count so they are not counted
// twice; other fenced languages (bash, json…) still read as prose. The same rates apply to
// both languages: prose length differs between them, and the word count reflects that.
const WORDS_PER_MINUTE = 165;
const JAVA_LINES_PER_MINUTE = 12.5;
const DIAGRAM_SECONDS = 18;

const JAVA_BLOCK = /```java\n([\s\S]*?)```/g;
const MERMAID_DIAGRAM = /<MermaidDiagram\b[\s\S]*?\/>/g;

/** Estimated minutes to read a guide from its raw MDX body (frontmatter excluded). Never below 1. */
export function readingMinutes(body: string): number {
  const javaLines = [...body.matchAll(JAVA_BLOCK)].reduce(
    (total, [, code]) => total + code.split('\n').filter((line) => line.trim().length > 0).length,
    0,
  );
  const diagrams = [...body.matchAll(MERMAID_DIAGRAM)].length;
  const words = body.replace(JAVA_BLOCK, '').replace(MERMAID_DIAGRAM, '').split(/\s+/).filter(Boolean).length;
  return Math.max(
    1,
    Math.round(words / WORDS_PER_MINUTE + javaLines / JAVA_LINES_PER_MINUTE + (diagrams * DIAGRAM_SECONDS) / 60),
  );
}

const MONTH_YEAR: Record<Lang, Intl.DateTimeFormat> = {
  es: new Intl.DateTimeFormat('es', { month: 'short', year: 'numeric', timeZone: 'UTC' }),
  en: new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }),
};

/** Abbreviated month and year in the edition's locale ("sept 2026", "Sep 2026"). Dates are UTC. */
export function formatMonthYear(date: Date, lang: Lang): string {
  return MONTH_YEAR[lang].format(date);
}

export interface TocHeading {
  depth: number;
  slug: string;
  text: string;
}

/** Fewer entries than this and a table of contents is noise, so none is shown. */
export const MIN_TOC_ENTRIES = 2;

/**
 * The table of contents of a guide: its sections (h2) and subsections (h3). The page
 * title is the only h1 and never comes from the body, and deeper levels would turn the
 * outline into a wall. Returns an empty list when there is too little to navigate.
 */
export function tocEntries(headings: readonly TocHeading[]): TocHeading[] {
  const entries = headings.filter((heading) => heading.depth === 2 || heading.depth === 3);
  return entries.length >= MIN_TOC_ENTRIES ? entries : [];
}
