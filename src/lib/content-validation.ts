/**
 * Structural validation of a `ContentModel`.
 *
 * Pure (no `astro:content`): the build feeds it the loaded collections and the tests
 * feed it the raw files, and both run these same checks.
 */

import { languages as LANGS, type Lang } from '@/i18n';

import type { ContentModel, Edition, GuideData, SubtopicData, TopicData } from './content-model';

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

function topicLabel(lang: Lang, topic: TopicData): string {
  return `[${lang}] topic "${topic.id}"`;
}

function subtopicLabel(lang: Lang, subtopic: SubtopicData): string {
  return `[${lang}] subtopic "${subtopic.id}"`;
}

function guideLabel(lang: Lang, guide: GuideData): string {
  return `[${lang}] guide "${guide.id}"`;
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

function validateEdition(lang: Lang, edition: Edition, errors: string[]): void {
  validateNodeFields(lang, edition, errors);
  validateDuplicateIdentities(lang, edition, errors);
  validateRootNamespace(lang, edition, errors);
  validateSubtopicReferences(lang, edition, errors);
  validateTaxonomyInvariants(lang, edition, errors);
  validateGuideStructure(lang, edition, errors);
  validateSectionUsage(lang, edition, errors);
  validateChildNamespaces(lang, edition, errors);
}

function validateNodeFields(lang: Lang, edition: Edition, errors: string[]): void {
  const { topics, subtopics, guides } = edition;

  for (const topic of topics) {
    const label = topicLabel(lang, topic);
    checkId(topic.id, label, errors);
    checkSlug(topic.slug, label, errors);
    checkOrder(topic.order, label, errors);
    validateSections(topic, label, errors);
    if (RESERVED_ROOT_SLUGS[lang].includes(topic.slug)) {
      errors.push(`${label}: slug "${topic.slug}" is reserved`);
    }
  }
  for (const subtopic of subtopics) {
    const label = subtopicLabel(lang, subtopic);
    checkId(subtopic.id, label, errors);
    checkSlug(subtopic.slug, label, errors);
    checkOrder(subtopic.order, label, errors);
    validateSections(subtopic, label, errors);
  }
  for (const guide of guides) {
    const label = guideLabel(lang, guide);
    checkId(guide.id, label, errors);
    checkSlug(guide.slug, label, errors);
    checkOrder(guide.order, label, errors);
  }
}

function validateDuplicateIdentities(lang: Lang, edition: Edition, errors: string[]): void {
  const { topics, subtopics, guides } = edition;

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
}

function validateRootNamespace(lang: Lang, edition: Edition, errors: string[]): void {
  const { topics } = edition;

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
}

function validateSubtopicReferences(lang: Lang, edition: Edition, errors: string[]): void {
  const topicsById = new Map(edition.topics.map((topic) => [topic.id, topic]));

  for (const subtopic of edition.subtopics) {
    if (!topicsById.has(subtopic.topic)) {
      errors.push(`${subtopicLabel(lang, subtopic)}: unknown topic "${subtopic.topic}"`);
    }
  }
}

function validateTaxonomyInvariants(lang: Lang, edition: Edition, errors: string[]): void {
  const subtopicsById = new Map(edition.subtopics.map((subtopic) => [subtopic.id, subtopic]));

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
}

function validateGuideStructure(lang: Lang, edition: Edition, errors: string[]): void {
  const topicsById = new Map(edition.topics.map((topic) => [topic.id, topic]));
  const subtopicsById = new Map(edition.subtopics.map((subtopic) => [subtopic.id, subtopic]));

  for (const guide of edition.guides) {
    validateGuideReferences(lang, guide, topicsById, subtopicsById, errors);
    validateGuideSectionReference(lang, guide, topicsById, subtopicsById, errors);
    validateGuideDates(lang, guide, errors);
  }
}

function validateGuideReferences(
  lang: Lang,
  guide: GuideData,
  topicsById: ReadonlyMap<string, TopicData>,
  subtopicsById: ReadonlyMap<string, SubtopicData>,
  errors: string[],
): void {
  if (!topicsById.has(guide.topic)) {
    errors.push(`${guideLabel(lang, guide)}: unknown topic "${guide.topic}"`);
  }
  if (guide.subtopic !== undefined) {
    const subtopic = subtopicsById.get(guide.subtopic);
    if (!subtopic) {
      errors.push(`${guideLabel(lang, guide)}: unknown subtopic "${guide.subtopic}"`);
    } else if (subtopic.topic !== guide.topic) {
      errors.push(
        `${guideLabel(lang, guide)}: subtopic "${guide.subtopic}" belongs to topic "${subtopic.topic}", not "${guide.topic}"`,
      );
    }
  }
}

function validateGuideSectionReference(
  lang: Lang,
  guide: GuideData,
  topicsById: ReadonlyMap<string, TopicData>,
  subtopicsById: ReadonlyMap<string, SubtopicData>,
  errors: string[],
): void {
  if (guide.section !== undefined) {
    const parent =
      guide.subtopic !== undefined
        ? subtopicsById.get(guide.subtopic)
        : topicsById.get(guide.topic);
    if (parent && !(parent.sections ?? []).some((section) => section.id === guide.section)) {
      errors.push(
        `${guideLabel(lang, guide)}: section "${guide.section}" is not declared by "${parent.id}"`,
      );
    }
  }
}

function validateGuideDates(lang: Lang, guide: GuideData, errors: string[]): void {
  if (!(guide.created instanceof Date) || Number.isNaN(guide.created.getTime())) {
    errors.push(`${guideLabel(lang, guide)}: invalid created date`);
  }
  if (!(guide.lastUpdated instanceof Date) || Number.isNaN(guide.lastUpdated.getTime())) {
    errors.push(`${guideLabel(lang, guide)}: invalid lastUpdated date`);
  } else if (guide.created instanceof Date && guide.lastUpdated < guide.created) {
    errors.push(`${guideLabel(lang, guide)}: lastUpdated is earlier than created`);
  }
}

function validateSectionUsage(lang: Lang, edition: Edition, errors: string[]): void {
  const { topics, subtopics, guides } = edition;
  const usesSection = (ownerId: string, sectionId: string, isSubtopic: boolean) =>
    guides.some(
      (guide) =>
        guide.section === sectionId &&
        (isSubtopic ? guide.subtopic === ownerId : guide.topic === ownerId && !guide.subtopic),
    );

  for (const topic of topics) {
    for (const section of topic.sections ?? []) {
      if (!usesSection(topic.id, section.id, false)) {
        errors.push(`${topicLabel(lang, topic)}: section "${section.id}" has no guides`);
      }
    }
  }
  for (const subtopic of subtopics) {
    for (const section of subtopic.sections ?? []) {
      if (!usesSection(subtopic.id, section.id, true)) {
        errors.push(`${subtopicLabel(lang, subtopic)}: section "${section.id}" has no guides`);
      }
    }
  }
}

function validateChildNamespaces(lang: Lang, edition: Edition, errors: string[]): void {
  const { topics, subtopics, guides } = edition;

  for (const topic of topics) {
    const children = subtopics.filter((subtopic) => subtopic.topic === topic.id);
    const direct = guides.filter(
      (guide) => guide.topic === topic.id && guide.subtopic === undefined,
    );
    if (children.length === 0 && direct.length === 0) {
      errors.push(`${topicLabel(lang, topic)}: has no guides or subtopics`);
    }

    const childSlugs = new Set(children.map((subtopic) => subtopic.slug));
    for (const guide of direct) {
      if (childSlugs.has(guide.slug)) {
        errors.push(
          `${guideLabel(lang, guide)}: slug "${guide.slug}" collides with a subtopic of "${topic.id}"`,
        );
      }
    }
    reportDuplicates(
      children.map((s) => s.slug),
      (slug) => `${topicLabel(lang, topic)}: duplicate subtopic slug "${slug}"`,
      errors,
    );
    reportDuplicates(
      children.map((s) => String(s.order)),
      (o) => `${topicLabel(lang, topic)}: duplicate subtopic order ${o}`,
      errors,
    );
    reportDuplicates(
      direct.map((g) => g.slug),
      (slug) => `${topicLabel(lang, topic)}: duplicate guide slug "${slug}"`,
      errors,
    );
    reportDuplicates(
      direct.map((g) => String(g.order)),
      (o) => `${topicLabel(lang, topic)}: duplicate guide order ${o}`,
      errors,
    );
  }
  for (const subtopic of subtopics) {
    const children = guides.filter((guide) => guide.subtopic === subtopic.id);
    if (children.length === 0) {
      errors.push(`${subtopicLabel(lang, subtopic)}: has no guides`);
    }
    reportDuplicates(
      children.map((g) => g.slug),
      (slug) => `${subtopicLabel(lang, subtopic)}: duplicate guide slug "${slug}"`,
      errors,
    );
    reportDuplicates(
      children.map((g) => String(g.order)),
      (o) => `${subtopicLabel(lang, subtopic)}: duplicate guide order ${o}`,
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
