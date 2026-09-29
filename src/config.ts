export const SITE_NAME = 'DevPedia';
/** Brand descriptor. It stays in English in every language edition. */
export const SITE_DESCRIPTION = 'A handbook for Software Engineering';
/** Canonical origin, from `site` in astro.config.mjs (set through the SITE_URL env var). */
export const SITE_URL = import.meta.env.SITE;
export const AUTHOR = 'Camila Sabino';
export const AUTHOR_URL = 'https://camilasabino.dev';
export const AUTHOR_GITHUB_URL = 'https://github.com/camilasabino';

/**
 * Social preview used by every page without a more specific image. Root-relative, so
 * it resolves against SITE_URL like every other URL.
 */
export const DEFAULT_OG_IMAGE = {
  path: '/og/devpedia.png',
  width: 1200,
  height: 630,
  type: 'image/png',
  alt: `${SITE_NAME}: ${SITE_DESCRIPTION}`,
} as const;

export const HOME_TITLE = `${SITE_NAME} — ${SITE_DESCRIPTION}`;

export function pageTitle(title: string): string {
  return `${title} | ${SITE_NAME}`;
}
