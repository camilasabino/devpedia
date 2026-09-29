import type { APIRoute } from 'astro';
import { SITE_URL } from '@/config';
import { languages, ui } from '@/i18n';
import { getContent } from '@/lib/content';
import { sitemapXml, type SitemapEntry } from '@/lib/seo';

export const GET: APIRoute = async () => {
  const { index } = await getContent();
  const homes = { es: ui.es.homePath, en: ui.en.homePath };
  const entries: SitemapEntry[] = [];
  for (const lang of languages) {
    entries.push({ path: homes[lang], alternates: homes });
    for (const route of index.routes(lang)) {
      entries.push({
        path: route.path,
        alternates: index.alternatesOf(route.kind, route.id),
        lastUpdated: route.kind === 'guide' ? index.guide(lang, route.id)!.lastUpdated : undefined,
      });
    }
  }
  return new Response(sitemapXml(entries, SITE_URL), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
