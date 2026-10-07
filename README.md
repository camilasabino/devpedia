# DevPedia

A handbook for Software Engineering

[![CI](https://github.com/camilasabino/devpedia/actions/workflows/ci.yml/badge.svg)](https://github.com/camilasabino/devpedia/actions/workflows/ci.yml)

DevPedia is a bilingual handbook for studying Software Engineering in depth and coming back to it as reference. Guides are grouped by subject so they can be studied and consulted later.

**[Explore DevPedia →](https://devpedia.camilasabino.dev)**

Live in production and actively maintained.

![DevPedia, a handbook for Software Engineering](public/og/devpedia.png)

## About

English is served at `/` and Spanish under `/es/`. Both editions cover the same topics, subtopics and guides.

```text
Topic → optional Subtopic → Guide
```

A topic or subtopic can group its guides into sections. The handbook is organized for learning and lookup, not as a chronological blog. Each guide is a technical article: explanation, code, tables and diagrams.

Search follows the edition you are reading. A Spanish page searches the Spanish guides; an English page searches the English ones.

Created by [Camila Sabino](https://camilasabino.dev).

## Content model

Every topic, subtopic and guide keeps three fields separate:

- **id** — stable conceptual identity. English kebab-case, the same in both languages. It pairs the Spanish and English editions, and it drives language alternates and analytics. It does not change, and it is not derived from the URL.
- **slug** — the localized URL segment for that edition. Published slugs stay stable.
- **order** — pedagogical position among sibling guides. It is not an identity.

## Architecture

DevPedia is a static [Astro](https://astro.build) site. Topics and subtopics are YAML content collections; guides are MDX.

`src/lib/content-model.ts` defines that model, builds paths and indexes both editions in `ContentIndex`. `src/lib/content-validation.ts` checks the structure: pairing, references, unique ids, slugs and orders, and sections. `src/lib/content.ts` loads the collections at build time and fails the build when validation fails. The same checks run in tests against the real files.

Localized routes are generated from that index. [Pagefind](https://pagefind.app) indexes the built site for search. [Cloudflare](https://www.cloudflare.com) serves the static output.

## Tech stack

| Area              | Choice                                |
| ----------------- | ------------------------------------- |
| Framework         | Astro 7, static output                |
| Content           | MDX and YAML content collections      |
| Search            | Pagefind                              |
| Styling           | Tailwind CSS v4                       |
| Testing / quality | Vitest, Astro check, ESLint, Prettier |
| Infrastructure    | Cloudflare static assets              |
| Analytics         | Google Analytics 4, optional          |

## Local development

Node `22.22.3` (see `.nvmrc`). `engines` allows `>=22.22.3`.

```bash
nvm use
npm install
npm run dev
```

The dev server runs at <http://localhost:4322>.

A `.env` file is optional. With none, `SITE_URL` defaults to `https://devpedia.camilasabino.dev` and analytics stays off. Copy `.env.example` to `.env` only to override those values.

- `SITE_URL` — canonical origin. Optional. Canonical URLs, hreflang, Open Graph, JSON-LD, the sitemap and `robots.txt` are built from it.
- `GA_MEASUREMENT_ID` — optional Google Analytics 4 measurement id (`G-XXXXXXXXXX`). Empty or unset means the site ships no analytics script and makes no request to Google.

Search is available after a production build, because Pagefind indexes `dist/`:

```bash
npm run build && npm run preview
```

## Commands

```bash
npm run dev            # http://localhost:4322
npm run build          # static site in dist/, then the Pagefind index
npm test               # Vitest
npm run lint           # ESLint
npm run format:check   # Prettier
npm run check          # astro check
npm run verify         # the full local quality gate
```

`verify` runs format, lint, typecheck, tests and the production build, then `check:links` (internal links and heading anchors) and `check:en-language` (Spanish left in the English edition).

## Testing and quality

Vitest covers the content model, routing, SEO, search and analytics. The content-model tests load the real topics, subtopics and guides. `astro check` typechecks the project. ESLint and Prettier cover syntax, unused code, braces and formatting. Prettier does not reformat `src/content/**`.

Husky runs lint and format checks before a commit, checks the message with commitlint, and on push lints again and checks the commits being pushed. Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/).

GitHub Actions runs the same `verify` gate on pull requests and on pushes to `main`. Pull requests also lint the commits they introduce.

## Deployment

`npm run build` writes a static site to `dist/` and Pagefind indexes that directory. Cloudflare serves those files as static assets. `wrangler.jsonc` names the project `devpedia`, points `assets.directory` at `./dist`, and attaches the custom domain `devpedia.camilasabino.dev`.

Production builds read the same `SITE_URL` and `GA_MEASUREMENT_ID` variables.

## Status

Live in production and actively maintained.

## License

All rights reserved. No open-source license is granted for reuse or redistribution.
