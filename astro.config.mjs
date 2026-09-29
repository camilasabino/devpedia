// @ts-check
import { defineConfig, envField } from 'astro/config';
import { loadEnv } from 'vite';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';

import { jdkTypeTransformer, shikiThemeDark, shikiThemeLight } from './src/lib/shiki-theme.ts';
import { rehypeExternalLinks } from './src/lib/rehype-external-links.ts';
import { rehypeGuideEnhancements } from './src/lib/rehype-guide-enhancements.ts';

// Reads SITE_URL from the environment or from .env. With an empty prefix,
// loadEnv also returns every variable already set in the process environment. The mode
// only picks `.env.<mode>` files, which this project does not use.
const envDir = decodeURIComponent(new URL('.', import.meta.url).pathname);
const env = loadEnv('production', envDir, '');

export default defineConfig({
  site: env.SITE_URL || 'https://devpedia.camilasabino.dev',

  server: { port: 4322 },

  // Two routes that generate the same URL fail the build instead of one silently
  // replacing the other. Duplicate content ids are caught in src/content.config.ts.
  prerenderConflictBehavior: 'error',

  env: {
    schema: {
      // Optional on purpose: when empty, no analytics script is rendered at all.
      GA_MEASUREMENT_ID: envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  markdown: {
    shikiConfig: {
      themes: {
        dark: shikiThemeDark,
        light: shikiThemeLight,
      },
      defaultColor: 'dark',
      transformers: [jdkTypeTransformer],
    },
    // Astro 7 runs remark/rehype plugins through the processor itself; MDX reuses it.
    processor: unified({ rehypePlugins: [rehypeExternalLinks, rehypeGuideEnhancements] }),
  },

  integrations: [mdx()],
});
