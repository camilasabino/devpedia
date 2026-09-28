import type { APIRoute } from 'astro';
import { SITE_URL } from '../config';
import { absoluteUrl } from '../lib/seo';

export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml', SITE_URL)}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
