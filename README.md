# DevPedia

_A handbook for Software Engineering_

DevPedia is a structured, evolving handbook for learning Software Engineering concepts in depth and revisiting them later as practical reference. Guides are organized by knowledge structure (topic, subtopic, section), not by publication date, and every guide exists in Spanish and English.

Created by Camila Sabino ([camilasabino.dev](https://camilasabino.dev)). The product definition lives in [`docs/specs/devpedia-spec.md`](docs/specs/devpedia-spec.md).

## Stack

- Astro 7 (static output, no adapter), MDX, Tailwind CSS v4 through `@tailwindcss/vite`.
- Shiki with a custom dual theme (`src/lib/shiki-theme.ts`) and two rehype plugins, run through `unified()` from `@astrojs/markdown-remark`.
- Mermaid, rendered client-side and lazily.
- Pagefind for search, indexed after the build.
- Optional GA4 with a small typed event contract.
- Vitest for unit tests, `@astrojs/check` for type checking.
- Cloudflare Workers static assets for hosting (no Worker script, no bindings).

## Content model

```text
Topic → optional Subtopic → Guide
```

Topics and subtopics can declare `sections` to group their guides. Each node has three independent fields:

- `id`: stable conceptual identity, English kebab-case, identical in both languages. It pairs the ES and EN editions and drives hreflang and analytics.
- `slug`: localized URL segment.
- `order`: pedagogical position among siblings.

The build validates the whole model (pairing, references, unique ids/slugs/orders, section usage, structure shared by both editions) and fails on any broken rule.

## i18n

Spanish at `/`, English under `/en/`. Both editions share the same topics, subtopics, sections and guides, paired by `id`. Routes: `/<topic>/`, `/<topic>/<guide>/`, `/<topic>/<subtopic>/`, `/<topic>/<subtopic>/<guide>/`.

## Structure

```text
src/
  config.ts          SITE_NAME, SITE_DESCRIPTION, SITE_URL, AUTHOR…
  content/           topics/ and subtopics/ (YAML), guides/ (MDX), each split into es/ and en/
  components/        Layout pieces, pages, MDX components (mdx/)
  i18n/              Interface strings per language
  lib/               Pure logic: content model and validation, sequence, SEO, search context, analytics
  pages/             Routes, sitemap.xml, robots.txt
  styles/            global.css plus design tokens (theme.css, surfaces.css)
public/              Favicons, OG image, topic covers
test/                Unit tests (they also load and validate the real content)
scripts/             Post-build checkers (links, leftover Spanish in the English edition)
docs/                Product spec, editorial guides, i18n record, implementation status
```

## Development

```bash
npm install
npm run dev            # http://localhost:4322
```

Search only works on a build (`npm run build && npm run preview`), because Pagefind indexes `dist/` after the build.

## Tests and checks

```bash
npm run check              # astro check
npm test                   # Vitest
npm run check:links        # internal links and anchors in dist/ (after the build)
npm run check:en-language  # leftover Spanish in the English edition (after the build)
```

There is no lint or formatting script.

## Environment

Read at build time from the environment or `.env` (see `.env.example`):

- `SITE_URL`: canonical origin, default `https://devpedia.camilasabino.dev`. Canonicals, hreflang, Open Graph URLs, JSON-LD, sitemap, robots and the analytics hostname check derive from it, so moving to another domain only needs this value and a deployment change.
- `GA_MEASUREMENT_ID`: optional GA4 id. Empty means no analytics script and no request to Google.

## Build

```bash
npm run build          # astro build → dist/, then pagefind --site dist
npm run preview
```

## Deployment

Cloudflare Workers Builds, static assets only. `wrangler.jsonc` sets `name: devpedia`, `assets.directory: ./dist` and the custom domain `devpedia.camilasabino.dev`. Build command `npm run build`, deploy command `npx wrangler deploy` (Wrangler is a devDependency, so the version is pinned by the lockfile). Set `GA_MEASUREMENT_ID`, and `SITE_URL` if the domain changes, as build variables.
