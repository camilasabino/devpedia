import type { ContentIndex, Lang, RouteKind } from './content-model';

/**
 * The context line a search result shows under its title, from the content model (never
 * from the URL):
 *
 *   guide     Topic › Subtopic › Section   (only the levels the guide has)
 *   subtopic  Topic
 *   topic     `topicLabel` ("Tema" / "Topic"), since a topic has no parent to name
 *
 * A section named like the guide itself (a section's overview guide) is left out, as it
 * would repeat the title right above it.
 */
export function searchContext(index: ContentIndex, lang: Lang, kind: RouteKind, id: string, topicLabel: string): string {
  if (kind === 'topic') return topicLabel;
  if (kind === 'subtopic') {
    const subtopic = index.subtopic(lang, id);
    return (subtopic && index.topic(lang, subtopic.topic)?.title) ?? '';
  }

  const guide = index.guide(lang, id);
  if (!guide) return '';
  const topic = index.topic(lang, guide.topic);
  const subtopic = guide.subtopic ? index.subtopic(lang, guide.subtopic) : undefined;
  const section = (subtopic ?? topic)?.sections?.find((candidate) => candidate.id === guide.section);
  const sectionTitle = section && section.title !== guide.title ? section.title : undefined;
  return [topic?.title, subtopic?.title, sectionTitle].filter(Boolean).join(' › ');
}
