import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import {
  absoluteUrl,
  breadcrumbJsonLd,
  imageType,
  sitemapXml,
  techArticleJsonLd,
  websiteJsonLd,
} from '@/lib/seo';
import { SUBTOPIC_COVERS, TOPIC_VISUALS, coverOf } from '@/lib/topic-visuals';

const SITE = 'https://handbook.example.org';

describe('DevPedia structured data', () => {
  it('describes each home as the DevPedia WebSite, on the given origin', () => {
    const data = websiteJsonLd({
      siteUrl: SITE,
      lang: 'en',
      homePath: '/',
      description: 'A handbook.',
    });
    expect(data).toMatchObject({
      '@type': 'WebSite',
      name: 'DevPedia',
      url: `${SITE}/`,
      inLanguage: 'en',
      creator: { '@type': 'Person', name: 'Camila Sabino' },
    });
  });

  it('describes a guide as a TechArticle that is part of DevPedia', () => {
    const data = techArticleJsonLd({
      siteUrl: SITE,
      lang: 'es',
      path: '/es/diseno/patrones/state/',
      homePath: '/es/',
      title: 'State',
      description: 'Estado.',
      section: 'Patrones',
      created: new Date('2026-01-02'),
      lastUpdated: new Date('2026-03-04'),
      imagePath: '/covers/design-patterns.jpg',
    });
    expect(data).toMatchObject({
      '@type': 'TechArticle',
      url: `${SITE}/es/diseno/patrones/state/`,
      image: `${SITE}/covers/design-patterns.jpg`,
      datePublished: '2026-01-02',
      dateModified: '2026-03-04',
      isPartOf: { '@type': 'WebSite', name: 'DevPedia', url: `${SITE}/es/` },
    });
    expect(JSON.stringify(data)).not.toContain('BlogPosting');
  });

  it('builds breadcrumbs with absolute URLs, in order', () => {
    const data = breadcrumbJsonLd(
      [
        { name: 'DevPedia', path: '/' },
        { name: 'Design', path: '/design/' },
      ],
      SITE,
    );
    expect(data.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'DevPedia', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Design', item: `${SITE}/design/` },
    ]);
  });

  it('derives image media types from the extension', () => {
    expect(imageType('/covers/testing.jpg')).toBe('image/jpeg');
    expect(imageType('/og/devpedia.png')).toBe('image/png');
    expect(imageType('/x.webp')).toBe('image/webp');
  });
});

describe('DevPedia sitemap', () => {
  const xml = sitemapXml(
    [
      {
        path: '/design/',
        alternates: { es: '/es/diseno/', en: '/design/' },
        lastUpdated: new Date('2026-05-06'),
      },
    ],
    SITE,
  );

  it('lists canonical URLs on the given origin with reciprocal alternates', () => {
    expect(xml).toContain(`<loc>${SITE}/design/</loc>`);
    expect(xml).toContain(`<lastmod>2026-05-06</lastmod>`);
    expect(xml).toContain(`hreflang="es" href="${SITE}/es/diseno/"`);
    expect(xml).toContain(`hreflang="en" href="${SITE}/design/"`);
    expect(xml).toContain(`hreflang="x-default" href="${SITE}/design/"`);
  });

  it('builds URLs only from the origin it is given', () => {
    expect(absoluteUrl('/es/', 'https://devpedia.camilasabino.dev')).toBe(
      'https://devpedia.camilasabino.dev/es/',
    );
    expect(xml).not.toContain('camilasabino.dev');
  });
});

describe('DevPedia topic visuals', () => {
  const ids = (files: Record<string, unknown>) =>
    Object.values(files as Record<string, string>).map(
      (source) => (parse(source) as { id: string }).id,
    );
  const topicIds = ids(
    import.meta.glob('../src/content/topics/es/*.yaml', {
      query: '?raw',
      import: 'default',
      eager: true,
    }),
  );
  const subtopicIds = ids(
    import.meta.glob('../src/content/subtopics/es/*.yaml', {
      query: '?raw',
      import: 'default',
      eager: true,
    }),
  );
  const coverFiles = Object.keys(import.meta.glob('../public/covers/*')).map((path) =>
    path.replace('../public', ''),
  );

  it('configures every topic, and only existing topics', () => {
    expect(Object.keys(TOPIC_VISUALS).sort()).toEqual([...topicIds].sort());
    expect(topicIds).toEqual(
      expect.arrayContaining(['architecture', 'design', 'testing', 'ai-engineering']),
    );
  });

  it('keys subtopic covers by existing subtopic ids', () => {
    for (const id of Object.keys(SUBTOPIC_COVERS)) {
      expect(subtopicIds).toContain(id);
    }
  });

  it('points every cover at a file in public/covers', () => {
    const covers = [
      ...Object.values(TOPIC_VISUALS).map((visual) => visual.cover),
      ...Object.values(SUBTOPIC_COVERS),
    ];
    for (const cover of covers) {
      expect(coverFiles).toContain(cover);
    }
  });

  it('prefers the subtopic cover, falling back to the topic', () => {
    expect(coverOf('design', 'design-patterns')).toBe('/covers/design-patterns.jpg');
    expect(coverOf('architecture')).toBe('/covers/architecture.jpg');
  });
});
