import { getCollection, type CollectionEntry } from 'astro:content';
import { ContentIndex, LANG_PREFIX, validateContentModel, type ContentModel, type Lang } from './content-model';

export type GuideEntry = CollectionEntry<'guidesEs'> | CollectionEntry<'guidesEn'>;

const COLLECTIONS = {
  es: { topics: 'topicsEs', subtopics: 'subtopicsEs', guides: 'guidesEs' },
  en: { topics: 'topicsEn', subtopics: 'subtopicsEn', guides: 'guidesEn' },
} as const;

export interface Content {
  index: ContentIndex;
  /** Renderable guide entry by language and id. */
  guideEntry(lang: Lang, id: string): GuideEntry;
}

async function load(): Promise<Content> {
  const entries = {} as Record<Lang, GuideEntry[]>;
  const model = {} as ContentModel;
  for (const lang of ['es', 'en'] as const) {
    const names = COLLECTIONS[lang];
    const [topics, subtopics, guides] = await Promise.all([
      getCollection(names.topics),
      getCollection(names.subtopics),
      getCollection(names.guides),
    ]);
    entries[lang] = guides;
    model[lang] = {
      topics: topics.map((entry) => entry.data),
      subtopics: subtopics.map((entry) => entry.data),
      guides: guides.map((entry) => entry.data),
    };
  }

  // A broken model fails the build instead of rendering pages with missing
  // counterparts or colliding URLs.
  const errors = validateContentModel(model);
  if (errors.length > 0) {
    throw new Error(`Invalid DevPedia content model:\n  - ${errors.join('\n  - ')}`);
  }

  return {
    index: new ContentIndex(model),
    guideEntry(lang, id) {
      const entry = entries[lang].find((guide) => guide.id === id);
      if (!entry) throw new Error(`No ${lang} guide "${id}"`);
      return entry;
    },
  };
}

let cached: Promise<Content> | undefined;

/** The validated content of both editions, loaded once per build (on every request in dev). */
export function getContent(): Promise<Content> {
  if (import.meta.env.DEV) return load();
  cached ??= load();
  return cached;
}

/** Static paths for one edition's catch-all route: every topic, subtopic and guide. */
export async function getStaticPathsFor(lang: Lang) {
  const { index } = await getContent();
  const prefix = `${LANG_PREFIX[lang]}/`;
  return index.routes(lang).map((route) => ({
    params: { path: route.path.slice(prefix.length, -1) },
    props: { lang, kind: route.kind, id: route.id },
  }));
}
