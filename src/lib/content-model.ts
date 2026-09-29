/**
 * DevPedia's content model: topics, subtopics and guides, in two languages.
 *
 * Every node separates three things that the old blog derived from one file name:
 *
 *   id    - stable conceptual identity. English, kebab-case, shared by both languages,
 *           unique within its content type. It pairs the two editions and never changes.
 *   slug  - localized URL segment. Only used for routing.
 *   order - pedagogical position among its siblings. Never identity.
 *
 * This module is pure (no `astro:content`), so the build and the unit tests run the
 * exact same validation and path logic: the build feeds it the loaded collections, the
 * tests feed it the raw files.
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

/**
 * Root-level segments a Spanish topic slug must not take: `en` is the English
 * edition, the rest are build output directories.
 */
const RESERVED_ROOT_SLUGS: Record<Lang, readonly string[]> = {
  es: ['en', '_astro', 'pagefind'],
  en: [],
};

/**
 * Placements the taxonomy must keep. A specific vendor tool never becomes a top-level
 * topic next to broader disciplines.
 */
const REQUIRED_SUBTOPIC_PARENTS: Readonly<Record<string, string>> = {
  'claude-code': 'ai-engineering',
};

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

/**
 * Checks every structural rule of the model and returns one message per problem
 * (empty when the model is valid). Deterministic: the same input always yields the
 * same messages in the same order.
 */
export function validateContentModel(model: ContentModel): string[] {
  const errors: string[] = [];
  for (const lang of LANGS) {
    validateEdition(lang, model[lang], errors);
  }
  validatePairing(model, errors);
  return errors;
}

function checkId(value: unknown, label: string, errors: string[]): void {
  if (typeof value !== 'string' || value === '') {
    errors.push(`${label}: missing id`);
  } else if (!KEBAB_CASE.test(value)) {
    errors.push(`${label}: id "${value}" is not kebab-case`);
  }
}

function checkSlug(value: unknown, label: string, errors: string[]): void {
  if (typeof value !== 'string' || value === '') {
    errors.push(`${label}: missing slug`);
  } else if (!KEBAB_CASE.test(value)) {
    errors.push(`${label}: slug "${value}" is not kebab-case`);
  }
}

function checkOrder(value: unknown, label: string, errors: string[]): void {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    errors.push(`${label}: order must be a positive integer`);
  }
}

function reportDuplicates(
  values: string[],
  describe: (value: string) => string,
  errors: string[],
): void {
  const seen = new Set<string>();
  const reported = new Set<string>();
  for (const value of values) {
    if (seen.has(value) && !reported.has(value)) {
      errors.push(describe(value));
      reported.add(value);
    }
    seen.add(value);
  }
}

function validateSections(owner: TopicData, label: string, errors: string[]): void {
  const sections = owner.sections ?? [];
  sections.forEach((section, i) => {
    checkId(section.id, `${label} section #${i + 1}`, errors);
    if (!section.title) {
      errors.push(`${label} section "${section.id}": missing title`);
    }
  });
  reportDuplicates(
    sections.map((section) => section.id),
    (id) => `${label}: duplicate section id "${id}"`,
    errors,
  );
}

function validateEdition(lang: Lang, edition: Edition, errors: string[]): void {
  const { topics, subtopics, guides } = edition;
  const topicLabel = (topic: TopicData) => `[${lang}] topic "${topic.id}"`;
  const subtopicLabel = (subtopic: SubtopicData) => `[${lang}] subtopic "${subtopic.id}"`;
  const guideLabel = (guide: GuideData) => `[${lang}] guide "${guide.id}"`;

  for (const topic of topics) {
    checkId(topic.id, topicLabel(topic), errors);
    checkSlug(topic.slug, topicLabel(topic), errors);
    checkOrder(topic.order, topicLabel(topic), errors);
    validateSections(topic, topicLabel(topic), errors);
    if (RESERVED_ROOT_SLUGS[lang].includes(topic.slug)) {
      errors.push(`${topicLabel(topic)}: slug "${topic.slug}" is reserved`);
    }
  }
  for (const subtopic of subtopics) {
    checkId(subtopic.id, subtopicLabel(subtopic), errors);
    checkSlug(subtopic.slug, subtopicLabel(subtopic), errors);
    checkOrder(subtopic.order, subtopicLabel(subtopic), errors);
    validateSections(subtopic, subtopicLabel(subtopic), errors);
  }
  for (const guide of guides) {
    checkId(guide.id, guideLabel(guide), errors);
    checkSlug(guide.slug, guideLabel(guide), errors);
    checkOrder(guide.order, guideLabel(guide), errors);
  }

  // Ids are unique within each content type.
  reportDuplicates(
    topics.map((t) => t.id),
    (id) => `[${lang}] duplicate topic id "${id}"`,
    errors,
  );
  reportDuplicates(
    subtopics.map((s) => s.id),
    (id) => `[${lang}] duplicate subtopic id "${id}"`,
    errors,
  );
  reportDuplicates(
    guides.map((g) => g.id),
    (id) => `[${lang}] duplicate guide id "${id}"`,
    errors,
  );

  // Root level: topic slugs and orders.
  reportDuplicates(
    topics.map((t) => t.slug),
    (slug) => `[${lang}] duplicate topic slug "${slug}"`,
    errors,
  );
  reportDuplicates(
    topics.map((t) => String(t.order)),
    (o) => `[${lang}] duplicate topic order ${o}`,
    errors,
  );

  const topicsById = new Map(topics.map((topic) => [topic.id, topic]));
  const subtopicsById = new Map(subtopics.map((subtopic) => [subtopic.id, subtopic]));

  for (const subtopic of subtopics) {
    if (!topicsById.has(subtopic.topic)) {
      errors.push(`${subtopicLabel(subtopic)}: unknown topic "${subtopic.topic}"`);
    }
  }
  for (const [subtopicId, topicId] of Object.entries(REQUIRED_SUBTOPIC_PARENTS)) {
    const subtopic = subtopicsById.get(subtopicId);
    if (!subtopic) {
      errors.push(`[${lang}] required subtopic "${subtopicId}" is missing`);
    } else if (subtopic.topic !== topicId) {
      errors.push(
        `[${lang}] subtopic "${subtopicId}" must live under topic "${topicId}", not "${subtopic.topic}"`,
      );
    }
  }

  for (const guide of guides) {
    if (!topicsById.has(guide.topic)) {
      errors.push(`${guideLabel(guide)}: unknown topic "${guide.topic}"`);
    }
    if (guide.subtopic !== undefined) {
      const subtopic = subtopicsById.get(guide.subtopic);
      if (!subtopic) {
        errors.push(`${guideLabel(guide)}: unknown subtopic "${guide.subtopic}"`);
      } else if (subtopic.topic !== guide.topic) {
        errors.push(
          `${guideLabel(guide)}: subtopic "${guide.subtopic}" belongs to topic "${subtopic.topic}", not "${guide.topic}"`,
        );
      }
    }
    if (guide.section !== undefined) {
      const parent =
        guide.subtopic !== undefined
          ? subtopicsById.get(guide.subtopic)
          : topicsById.get(guide.topic);
      if (parent && !(parent.sections ?? []).some((section) => section.id === guide.section)) {
        errors.push(
          `${guideLabel(guide)}: section "${guide.section}" is not declared by "${parent.id}"`,
        );
      }
    }
    if (!(guide.created instanceof Date) || Number.isNaN(guide.created.getTime())) {
      errors.push(`${guideLabel(guide)}: invalid created date`);
    }
    if (!(guide.lastUpdated instanceof Date) || Number.isNaN(guide.lastUpdated.getTime())) {
      errors.push(`${guideLabel(guide)}: invalid lastUpdated date`);
    } else if (guide.created instanceof Date && guide.lastUpdated < guide.created) {
      errors.push(`${guideLabel(guide)}: lastUpdated is earlier than created`);
    }
  }

  // Every declared section is used by at least one guide of its owner.
  const usesSection = (ownerId: string, sectionId: string, isSubtopic: boolean) =>
    guides.some(
      (guide) =>
        guide.section === sectionId &&
        (isSubtopic ? guide.subtopic === ownerId : guide.topic === ownerId && !guide.subtopic),
    );
  for (const topic of topics) {
    for (const section of topic.sections ?? []) {
      if (!usesSection(topic.id, section.id, false)) {
        errors.push(`${topicLabel(topic)}: section "${section.id}" has no guides`);
      }
    }
  }
  for (const subtopic of subtopics) {
    for (const section of subtopic.sections ?? []) {
      if (!usesSection(subtopic.id, section.id, true)) {
        errors.push(`${subtopicLabel(subtopic)}: section "${section.id}" has no guides`);
      }
    }
  }

  // Inside a topic, subtopics and direct guides share one URL namespace.
  for (const topic of topics) {
    const children = subtopics.filter((subtopic) => subtopic.topic === topic.id);
    const direct = guides.filter(
      (guide) => guide.topic === topic.id && guide.subtopic === undefined,
    );
    if (children.length === 0 && direct.length === 0) {
      errors.push(`${topicLabel(topic)}: has no guides or subtopics`);
    }

    const childSlugs = new Set(children.map((subtopic) => subtopic.slug));
    for (const guide of direct) {
      if (childSlugs.has(guide.slug)) {
        errors.push(
          `${guideLabel(guide)}: slug "${guide.slug}" collides with a subtopic of "${topic.id}"`,
        );
      }
    }
    reportDuplicates(
      children.map((s) => s.slug),
      (slug) => `${topicLabel(topic)}: duplicate subtopic slug "${slug}"`,
      errors,
    );
    reportDuplicates(
      children.map((s) => String(s.order)),
      (o) => `${topicLabel(topic)}: duplicate subtopic order ${o}`,
      errors,
    );
    reportDuplicates(
      direct.map((g) => g.slug),
      (slug) => `${topicLabel(topic)}: duplicate guide slug "${slug}"`,
      errors,
    );
    reportDuplicates(
      direct.map((g) => String(g.order)),
      (o) => `${topicLabel(topic)}: duplicate guide order ${o}`,
      errors,
    );
  }
  for (const subtopic of subtopics) {
    const children = guides.filter((guide) => guide.subtopic === subtopic.id);
    if (children.length === 0) {
      errors.push(`${subtopicLabel(subtopic)}: has no guides`);
    }
    reportDuplicates(
      children.map((g) => g.slug),
      (slug) => `${subtopicLabel(subtopic)}: duplicate guide slug "${slug}"`,
      errors,
    );
    reportDuplicates(
      children.map((g) => String(g.order)),
      (o) => `${subtopicLabel(subtopic)}: duplicate guide order ${o}`,
      errors,
    );
  }
}

const sectionIds = (owner: TopicData | undefined) =>
  (owner?.sections ?? []).map((section) => section.id).join(',');

/** Both editions must share the same ids and the same structure; only wording and slugs differ. */
function validatePairing(model: ContentModel, errors: string[]): void {
  const { es, en } = model;

  const compareIds = (type: string, esIds: string[], enIds: string[]) => {
    const enSet = new Set(enIds);
    const esSet = new Set(esIds);
    for (const id of esIds) {
      if (!enSet.has(id)) {
        errors.push(`${type} "${id}" has no English counterpart`);
      }
    }
    for (const id of enIds) {
      if (!esSet.has(id)) {
        errors.push(`${type} "${id}" has no Spanish counterpart`);
      }
    }
  };
  compareIds(
    'topic',
    es.topics.map((t) => t.id),
    en.topics.map((t) => t.id),
  );
  compareIds(
    'subtopic',
    es.subtopics.map((s) => s.id),
    en.subtopics.map((s) => s.id),
  );
  compareIds(
    'guide',
    es.guides.map((g) => g.id),
    en.guides.map((g) => g.id),
  );

  const mismatch = (type: string, id: string, field: string, a: unknown, b: unknown) => {
    if (a !== b) {
      errors.push(
        `${type} "${id}": ${field} differs between editions (es: ${String(a)}, en: ${String(b)})`,
      );
    }
  };

  for (const topic of es.topics) {
    const other = en.topics.find((t) => t.id === topic.id);
    if (!other) {
      continue;
    }
    mismatch('topic', topic.id, 'order', topic.order, other.order);
    mismatch('topic', topic.id, 'icon', topic.icon, other.icon);
    mismatch('topic', topic.id, 'sections', sectionIds(topic), sectionIds(other));
  }
  for (const subtopic of es.subtopics) {
    const other = en.subtopics.find((s) => s.id === subtopic.id);
    if (!other) {
      continue;
    }
    mismatch('subtopic', subtopic.id, 'topic', subtopic.topic, other.topic);
    mismatch('subtopic', subtopic.id, 'order', subtopic.order, other.order);
    mismatch('subtopic', subtopic.id, 'icon', subtopic.icon, other.icon);
    mismatch('subtopic', subtopic.id, 'sections', sectionIds(subtopic), sectionIds(other));
  }
  for (const guide of es.guides) {
    const other = en.guides.find((g) => g.id === guide.id);
    if (!other) {
      continue;
    }
    mismatch('guide', guide.id, 'topic', guide.topic, other.topic);
    mismatch('guide', guide.id, 'subtopic', guide.subtopic, other.subtopic);
    mismatch('guide', guide.id, 'section', guide.section, other.section);
    mismatch('guide', guide.id, 'order', guide.order, other.order);
  }
}
