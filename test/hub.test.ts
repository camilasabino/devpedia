import { describe, expect, it } from 'vitest';
import type { GuideData } from '@/lib/content-model';
import { groupBySection } from '@/lib/hub';

const guide = (id: string, order: number, section?: string): GuideData => ({
  id,
  slug: id,
  order,
  topic: 'topic',
  section,
  title: id,
  description: id,
  created: new Date('2026-01-01'),
  lastUpdated: new Date('2026-01-01'),
});

const ids = (groups: ReturnType<typeof groupBySection>) =>
  groups.map((group) => [group.section?.id, group.guides.map((g) => g.id)]);

describe('groupBySection', () => {
  const sections = [
    { id: 'first', title: 'First' },
    { id: 'second', title: 'Second' },
  ];

  it('follows the declared section order and sorts each group by order', () => {
    const guides = [
      guide('c', 3, 'first'),
      guide('d', 12, 'second'),
      guide('a', 1, 'second'),
      guide('b', 2, 'first'),
    ];
    expect(ids(groupBySection({ sections }, guides))).toEqual([
      ['first', ['b', 'c']],
      ['second', ['a', 'd']],
    ]);
  });

  it('puts guides without a section first, in a group without a heading', () => {
    const guides = [guide('b', 2, 'first'), guide('a', 1)];
    expect(ids(groupBySection({ sections }, guides))).toEqual([
      [undefined, ['a']],
      ['first', ['b']],
    ]);
  });

  it('returns one ordered group when the node declares no sections', () => {
    expect(ids(groupBySection({}, [guide('b', 2), guide('a', 1)]))).toEqual([
      [undefined, ['a', 'b']],
    ]);
  });
});
