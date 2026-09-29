// Structured data and sitemap builders. Pure functions over plain data and an explicit
// site origin, so they stay independent of Astro and are covered by unit tests. Every
// absolute URL is built from the origin they are given (SITE_URL at build time).
import { AUTHOR, AUTHOR_URL, SITE_NAME } from '@/config';
import type { Lang } from './content-model';

type JsonLd = Record<string, unknown>;

/** Media type of a root-relative image path, from its extension. */
export function imageType(path: string): string {
  const extension = path.split('.').pop()?.toLowerCase();
  return extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' : `image/${extension}`;
}

export function absoluteUrl(path: string, siteUrl: string | URL): string {
  return new URL(path, siteUrl).toString();
}

const author = (): JsonLd => ({ '@type': 'Person', name: AUTHOR, url: AUTHOR_URL });

export function websiteJsonLd(input: {
  siteUrl: string | URL;
  lang: Lang;
  homePath: string;
  description: string;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: absoluteUrl(input.homePath, input.siteUrl),
    description: input.description,
    inLanguage: input.lang,
    creator: author(),
  };
}

export function techArticleJsonLd(input: {
  siteUrl: string | URL;
  lang: Lang;
  path: string;
  homePath: string;
  title: string;
  description: string;
  /** Topic, or subtopic when the guide lives under one. */
  section: string;
  created: Date;
  lastUpdated: Date;
  imagePath: string;
}): JsonLd {
  const url = absoluteUrl(input.path, input.siteUrl);
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: input.title,
    description: input.description,
    inLanguage: input.lang,
    url,
    mainEntityOfPage: url,
    image: absoluteUrl(input.imagePath, input.siteUrl),
    articleSection: input.section,
    datePublished: isoDate(input.created),
    dateModified: isoDate(input.lastUpdated),
    author: author(),
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: absoluteUrl(input.homePath, input.siteUrl),
    },
  };
}

export interface Crumb {
  name: string;
  path: string;
}

/** Breadcrumb trail from the DevPedia home (first crumb) to the current page (last). */
export function breadcrumbJsonLd(crumbs: Crumb[], siteUrl: string | URL): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path, siteUrl),
    })),
  };
}

export interface SitemapEntry {
  path: string;
  /** The same page in every language, by root-relative path. */
  alternates: Record<Lang, string>;
  lastUpdated?: Date;
}

const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

/**
 * Sitemap with reciprocal hreflang alternates. `x-default` points at the Spanish
 * edition, matching the pages' own `<link rel="alternate">` tags.
 */
export function sitemapXml(entries: SitemapEntry[], siteUrl: string | URL): string {
  const url = (path: string) => escapeXml(absoluteUrl(path, siteUrl));
  const body = entries
    .map((entry) => {
      const links = [
        ...Object.entries(entry.alternates).map(
          ([lang, path]) =>
            `    <xhtml:link rel="alternate" hreflang="${lang}" href="${url(path)}"/>`,
        ),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${url(entry.alternates.es)}"/>`,
      ];
      const lastmod = entry.lastUpdated
        ? [`    <lastmod>${isoDate(entry.lastUpdated)}</lastmod>`]
        : [];
      return [
        '  <url>',
        `    <loc>${url(entry.path)}</loc>`,
        ...lastmod,
        ...links,
        '  </url>',
      ].join('\n');
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
