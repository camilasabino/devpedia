/**
 * DevPedia's content model: topics, subtopics and guides, in two languages.
 *
 * Every node separates three things:
 *
 *   id    - stable conceptual identity. English, kebab-case, shared by both languages,
 *           unique within its content type. It pairs the two editions and never changes.
 *   slug  - localized URL segment. Only used for routing.
 *   order - pedagogical position among its siblings. Never identity.
 *
 * This module is pure (no `astro:content`), so the build and the unit tests share the
 * same path and index logic.
 */

import { languages as LANGS, type Lang } from '@/i18n';

export type { Lang };

export interface Section {
  id: string;
  title: string;
}

export interface TopicData {
  id: string;
  slug: string;
  order: number;
  title: string;
  description: string;
  icon: string;
  /** Groups for the guides that live directly under this topic, in display order. */
  sections?: Section[];
}

export interface SubtopicData extends TopicData {
  /** Parent topic id. */
  topic: string;
}

export interface GuideData {
  id: string;
  slug: string;
  order: number;
  topic: string;
  subtopic?: string;
  /** Section id, declared by the guide's direct parent (its subtopic, else its topic). */
  section?: string;
  title: string;
  description: string;
  created: Date;
  lastUpdated: Date;
  cover?: string;
}

export interface Edition {
  topics: TopicData[];
  subtopics: SubtopicData[];
  guides: GuideData[];
}

export type ContentModel = Record<Lang, Edition>;

/** Path prefix of each edition. Spanish is the default language and lives at the root. */
export const LANG_PREFIX: Record<Lang, string> = { es: '', en: '/en' };

export function topicPath(lang: Lang, topic: Pick<TopicData, 'slug'>): string {
  return `${LANG_PREFIX[lang]}/${topic.slug}/`;
}

export function subtopicPath(
  lang: Lang,
  topic: Pick<TopicData, 'slug'>,
  subtopic: Pick<SubtopicData, 'slug'>,
): string {
  return `${topicPath(lang, topic)}${subtopic.slug}/`;
}

export function guidePath(
  lang: Lang,
  topic: Pick<TopicData, 'slug'>,
  subtopic: Pick<SubtopicData, 'slug'> | undefined,
  guide: Pick<GuideData, 'slug'>,
): string {
  const parent = subtopic ? subtopicPath(lang, topic, subtopic) : topicPath(lang, topic);
  return `${parent}${guide.slug}/`;
}

export type RouteKind = 'topic' | 'subtopic' | 'guide';

export interface Route {
  kind: RouteKind;
  /** Conceptual id of the node the route renders. */
  id: string;
  path: string;
}

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

/** Read-only lookups over one validated model. */
export class ContentIndex {
  constructor(readonly model: ContentModel) {}

  topics(lang: Lang): TopicData[] {
    return [...this.model[lang].topics].sort(byOrder);
  }

  topic(lang: Lang, id: string): TopicData | undefined {
    return this.model[lang].topics.find((topic) => topic.id === id);
  }

  subtopic(lang: Lang, id: string): SubtopicData | undefined {
    return this.model[lang].subtopics.find((subtopic) => subtopic.id === id);
  }

  guide(lang: Lang, id: string): GuideData | undefined {
    return this.model[lang].guides.find((guide) => guide.id === id);
  }

  subtopicsOf(lang: Lang, topicId: string): SubtopicData[] {
    return this.model[lang].subtopics
      .filter((subtopic) => subtopic.topic === topicId)
      .sort(byOrder);
  }

  /** Guides directly under a topic, or under one of its subtopics when `subtopicId` is given. */
  guidesOf(lang: Lang, topicId: string, subtopicId?: string): GuideData[] {
    return this.model[lang].guides
      .filter((guide) => guide.topic === topicId && guide.subtopic === subtopicId)
      .sort(byOrder);
  }

  /** Every guide of a topic, including the ones under its subtopics. */
  guideCount(lang: Lang, topicId: string): number {
    return this.model[lang].guides.filter((guide) => guide.topic === topicId).length;
  }

  pathOf(lang: Lang, kind: RouteKind, id: string): string | undefined {
    if (kind === 'topic') {
      const topic = this.topic(lang, id);
      return topic && topicPath(lang, topic);
    }
    if (kind === 'subtopic') {
      const subtopic = this.subtopic(lang, id);
      const topic = subtopic && this.topic(lang, subtopic.topic);
      return topic && subtopic && subtopicPath(lang, topic, subtopic);
    }
    const guide = this.guide(lang, id);
    const topic = guide && this.topic(lang, guide.topic);
    if (!guide || !topic) {
      return undefined;
    }
    const subtopic = guide.subtopic ? this.subtopic(lang, guide.subtopic) : undefined;
    return guidePath(lang, topic, subtopic, guide);
  }

  /** The same node's path in every language, resolved by id. */
  alternatesOf(kind: RouteKind, id: string): Record<Lang, string> {
    const entries = LANGS.map((lang) => {
      const path = this.pathOf(lang, kind, id);
      if (!path) {
        throw new Error(`No ${lang} counterpart for ${kind} "${id}"`);
      }
      return [lang, path] as const;
    });
    return Object.fromEntries(entries) as Record<Lang, string>;
  }

  routes(lang: Lang): Route[] {
    const { topics, subtopics, guides } = this.model[lang];
    return [
      ...topics.map((topic) => ({ kind: 'topic' as const, id: topic.id })),
      ...subtopics.map((subtopic) => ({ kind: 'subtopic' as const, id: subtopic.id })),
      ...guides.map((guide) => ({ kind: 'guide' as const, id: guide.id })),
    ].map((route) => ({ ...route, path: this.pathOf(lang, route.kind, route.id)! }));
  }
}
