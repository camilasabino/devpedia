/**
 * Visual identity of each topic, keyed by its conceptual id so both editions share it.
 * This is the only place topic colors and covers are defined: headers, cards, hub
 * pages and social previews read them from here instead of keeping their own maps.
 * The topic icon is content, not presentation, and stays in the topic YAML.
 *
 * Class strings are complete literals on purpose: Tailwind only generates classes it
 * finds written out in full somewhere in the source.
 */
export interface TopicVisual {
  /** Social preview and hero image, root-relative (served from public/covers/). */
  cover: string;
  /** Tinted background plus foreground, for icon badges and count chips. */
  badge: string;
  /** Foreground only, for text in the topic's color. */
  text: string;
}

export const TOPIC_VISUALS: Readonly<Record<string, TopicVisual>> = {
  architecture: {
    cover: '/covers/architecture.jpg',
    badge: 'bg-sky-500/20 text-sky-300 light:bg-sky-500/15 light:text-sky-700',
    text: 'text-sky-300 light:text-sky-700',
  },
  design: {
    cover: '/covers/design.jpg',
    badge: 'bg-violet-500/20 text-violet-300 light:bg-violet-500/15 light:text-violet-700',
    text: 'text-violet-300 light:text-violet-700',
  },
  testing: {
    cover: '/covers/testing.jpg',
    badge: 'bg-green-500/20 text-green-300 light:bg-green-500/15 light:text-green-700',
    text: 'text-green-300 light:text-green-700',
  },
  'ai-engineering': {
    cover: '/covers/ai-engineering.jpg',
    badge: 'bg-yellow-500/20 text-yellow-300 light:bg-yellow-500/15 light:text-yellow-700',
    text: 'text-yellow-300 light:text-yellow-700',
  },
};

/** Subtopics with a cover of their own; the rest use their topic's. */
export const SUBTOPIC_COVERS: Readonly<Record<string, string>> = {
  'claude-code': '/covers/claude-code.jpg',
  'design-principles': '/covers/design-principles.jpg',
  'design-patterns': '/covers/design-patterns.jpg',
};

export function topicVisual(topicId: string): TopicVisual {
  const visual = TOPIC_VISUALS[topicId];
  if (!visual) throw new Error(`No visual configuration for topic "${topicId}" in topic-visuals.ts`);
  return visual;
}

/** The most specific cover for a node: its subtopic's when it has one, else its topic's. */
export function coverOf(topicId: string, subtopicId?: string): string {
  return (subtopicId && SUBTOPIC_COVERS[subtopicId]) || topicVisual(topicId).cover;
}
