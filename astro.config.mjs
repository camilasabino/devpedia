// @ts-check
import { defineConfig, envField } from 'astro/config';
import { loadEnv } from 'vite';

import tailwindcss from '@tailwindcss/vite';

// Reads SITE_URL from the environment or from devpedia/.env. With an empty prefix,
// loadEnv also returns every variable already set in the process environment. The mode
// only picks `.env.<mode>` files, which this project does not use.
const envDir = decodeURIComponent(new URL('.', import.meta.url).pathname);
const env = loadEnv('production', envDir, '');

// DevPedia is its own Astro project, built and deployed independently of the
// portfolio at the repository root: run it with `npm run dev:devpedia` / `npm run build:devpedia`,
// which pass `--root devpedia`, so src/, public/ and dist/ resolve inside this folder.
export default defineConfig({
  site: env.SITE_URL || 'https://devpedia.camilasabino.dev',

  server: { port: 4322 },

  env: {
    schema: {
      // Optional on purpose: when empty, no analytics script is rendered at all.
      GA_MEASUREMENT_ID: envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
