import type { GuideData, Section, TopicData } from './content-model';

/** A run of guides shown together on a hub page, under its section when it has one. */
export interface GuideGroup {
  section?: Section;
  guides: GuideData[];
}

const byOrder = (a: GuideData, b: GuideData) => a.order - b.order;

/**
 * Groups a node's own guides by the sections it declares, in the declared section
 * order, each group sorted by `order`. Guides without a section come first, as a
 * group without a heading. Empty groups are dropped.
 */
export function groupBySection(owner: Pick<TopicData, 'sections'>, guides: readonly GuideData[]): GuideGroup[] {
  const sorted = [...guides].sort(byOrder);
  return [
    { guides: sorted.filter((guide) => !guide.section) },
    ...(owner.sections ?? []).map((section) => ({
      section,
      guides: sorted.filter((guide) => guide.section === section.id),
    })),
  ].filter((group) => group.guides.length > 0);
}
