import { parse } from 'yaml';
import type { ContentModel, GuideData, Lang, SubtopicData, TopicData } from '@/lib/content-model';

// DevPedia's real content files, for suites that check rules the build enforces. The
// files are read through `import.meta.glob`, which resolves at build time: the suites run
// in the Workers pool, where `node:fs` is not available.

const raw = (files: Record<string, unknown>) => files as Record<string, string>;

export const SOURCES = {
  es: {
    topics: raw(
      import.meta.glob('../src/content/topics/es/*.yaml', {
        query: '?raw',
        import: 'default',
        eager: true,
      }),
    ),
    subtopics: raw(
      import.meta.glob('../src/content/subtopics/es/*.yaml', {
        query: '?raw',
        import: 'default',
        eager: true,
      }),
    ),
    guides: raw(
      import.meta.glob('../src/content/guides/es/**/*.mdx', {
        query: '?raw',
        import: 'default',
        eager: true,
      }),
    ),
  },
  en: {
    topics: raw(
      import.meta.glob('../src/content/topics/en/*.yaml', {
        query: '?raw',
        import: 'default',
        eager: true,
      }),
    ),
    subtopics: raw(
      import.meta.glob('../src/content/subtopics/en/*.yaml', {
        query: '?raw',
        import: 'default',
        eager: true,
      }),
    ),
    guides: raw(
      import.meta.glob('../src/content/guides/en/**/*.mdx', {
        query: '?raw',
        import: 'default',
        eager: true,
      }),
    ),
  },
};

export const FRONTMATTER = /^---\n([\s\S]*?)\n---\n/;

export function frontmatter(source: string, path: string): Record<string, unknown> {
  const match = FRONTMATTER.exec(source);
  if (!match) {
    throw new Error(`${path} has no frontmatter`);
  }
  return parse(match[1]) as Record<string, unknown>;
}

function toGuide(data: Record<string, unknown>): GuideData {
  return {
    ...data,
    created: new Date(String(data.created)),
    lastUpdated: new Date(String(data.lastUpdated)),
  } as GuideData;
}

export function loadModel(): ContentModel {
  const edition = (lang: Lang) => ({
    topics: Object.values(SOURCES[lang].topics).map((source) => parse(source) as TopicData),
    subtopics: Object.values(SOURCES[lang].subtopics).map(
      (source) => parse(source) as SubtopicData,
    ),
    guides: Object.entries(SOURCES[lang].guides).map(([path, source]) =>
      toGuide(frontmatter(source, path)),
    ),
  });
  return { es: edition('es'), en: edition('en') };
}

/** A deep copy of the real model, so a test can break one rule in isolation. */
export const cloneModel = (): ContentModel => loadModel();

export const bodies = (lang: Lang) =>
  Object.entries(SOURCES[lang].guides).map(([path, source]) => ({
    path,
    body: source.replace(FRONTMATTER, ''),
  }));
