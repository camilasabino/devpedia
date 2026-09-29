# DevPedia implementation status

Implementation state between sessions. The product definition lives in `docs/specs/devpedia-spec.md` (versioned in this repository, the single source of truth for the product); this file does not restate it.

M1–M8 were built inside the `camilasabino.dev` repository, where DevPedia lived in `devpedia/`. Their sections below are historical: a path such as `devpedia/src/lib/guide.ts` is now `src/lib/guide.ts`, `test/devpedia/*` is now `test/*`, `npm run build:devpedia` is now `npm run build`, and `wrangler.devpedia.jsonc` is now `wrangler.jsonc`. See "M9 — Repository separation" for the current layout.

## Current milestone

`M9 — COMPLETE`

## Final state

`Initial DevPedia migration and repository separation — COMPLETE`

- M1–M9 complete. M1–M8 are committed in `camilasabino.dev` (M1–M7 history carried over here); M9 is in the working trees of both repositories, pending user validation.
- Architecture: DevPedia is a standalone repository and Astro project (`devpedia.camilasabino.dev` by default through `SITE_URL`, `wrangler.jsonc`). It owns its config, metadata, sitemap, robots, Pagefind, analytics, content, routing, branding, layouts, UI primitives, design tokens, tests, scripts and docs. No code, CSS, build or runtime reference to `camilasabino.dev`; the portfolio only links to it through its own `DEVPEDIA_URL`.
- Content: 68 ES + 68 EN guides paired by `id`; 4 topics and 3 subtopics per language; Claude Code under AI Engineering.
- Next: create GitHub remote and deploy DevPedia. Order: (1) create DevPedia's GitHub repository and connect it as `origin`; (2) set up the Cloudflare Workers Builds project, custom domain and `GA_MEASUREMENT_ID`; (3) deploy DevPedia; (4) verify `devpedia.camilasabino.dev`; (5) deploy `camilasabino.dev`. Nothing has been deployed or pushed; this repository has no remote.
- Follow-ups: see "M9 — Follow-ups". Per-milestone known debt below is historical unless listed there.

## M1 — Implemented

- Second Astro project in `devpedia/`, independent of the portfolio at the repository root.
- Own config: `devpedia/astro.config.mjs` (`site`, dev port 4322, `astro:env` schema, Tailwind), `devpedia/tsconfig.json`, `devpedia/.env.example`.
- `devpedia/src/config.ts`: `SITE_NAME`, `SITE_DESCRIPTION` ("A handbook for Software Engineering", English in both languages), `SITE_URL`, `AUTHOR`, `AUTHOR_URL`.
- `SITE_URL` configurable through the `SITE_URL` env var or `devpedia/.env`; default `https://devpedia.camilasabino.dev`. Canonical and hreflang derive from it.
- Optional GA4: `GA_MEASUREMENT_ID` (`astro:env`, client, optional). Empty means no script and no request to Google. When set, the script only runs in production builds on the `SITE_URL` hostname.
- Theme sharing: `src/styles/theme.css` holds `@theme` (fonts, accent colors) and the `light` custom variant; imported by both `src/styles/global.css` and `devpedia/src/styles/global.css`.
- `devpedia/src/layouts/BaseLayout.astro`: own head (canonical, hreflang incl. `x-default`, OG/Twitter meta without image, fonts, theme script, GA), skip link, header with wordmark, ES/EN switcher (`Flag`) and `ThemeToggle`.
- `devpedia/src/i18n/index.ts`: `Lang`, `languages`, minimal UI copy.
- Placeholder homes: `devpedia/src/pages/index.astro` (ES, `/`) and `devpedia/src/pages/en/index.astro` (EN, `/en/`).
- Shared primitives imported by relative path from `src/components/`: `Flag`, `ThemeToggle` (and `Icon`, through `ThemeToggle`).
- `wrangler.devpedia.jsonc`: assets only (`./devpedia/dist`), `name: "devpedia"`, custom domain `devpedia.camilasabino.dev`. Not deployed.
- Type checking: `@astrojs/check` and `typescript` devDependencies. Small portfolio type fixes with no output change (`Icon.astro`, `BlogSearch.astro`, `ArticlePage.astro`).
- Scripts in `package.json`:
  - `check`: `astro check && astro check --root devpedia`
  - `dev:devpedia`: `cd devpedia && astro dev`
  - `build:devpedia`: `astro build --root devpedia && pagefind --site devpedia/dist`
  - `preview:devpedia`: `cd devpedia && astro preview`

## M1 — Relevant implementation decisions

- `dev:devpedia` and `preview:devpedia` run from inside `devpedia/`. Astro 7's `astro dev` starts a background process that resolves `--root devpedia` a second time (ending in `devpedia/devpedia/`, no config, no pages). `build` and `check` use `--root devpedia` without issue. Stop the dev server with `cd devpedia && npx astro dev stop`.
- `devpedia/astro.config.mjs` does not set `root`/`srcDir`/`publicDir`/`outDir`: Astro's defaults already resolve inside `devpedia/`.
- `SITE_URL` is read with Vite's `loadEnv` (empty prefix, so it includes `process.env`), not `process.env` directly, to avoid needing `@types/node`.
- The root `tsconfig.json` excludes `devpedia`, `src/worker`, `test/worker` and `test/env.d.ts`. The Worker needs Cloudflare runtime types that are not installed; it is still exercised by `npm test` and is removed at cutover (M7).
- `src/styles/global.css` has `@source not "../../devpedia"`. Without it, Tailwind scans `devpedia/src` and changes the portfolio CSS.
- `devpedia/src/styles/global.css` has explicit `@source` entries for each shared primitive it renders (`Icon`, `Flag`, `ThemeToggle`); they are outside DevPedia's root and are not scanned otherwise. Add an entry for every new shared primitive.
- Theme token extraction is partial: only `@theme` and the `light` variant moved. (Surface/text tokens followed in M3, see below.)
- No favicon yet in DevPedia (`/favicon.ico` 404). Resolved in M3.

## M2 — Implemented

- Content model in `devpedia/src/content.config.ts`: collections `topicsEs`, `topicsEn`, `subtopicsEs`, `subtopicsEn`, `guidesEs`, `guidesEn`. Files live under `devpedia/src/content/{topics,subtopics}/{es,en}/*.yaml` and `devpedia/src/content/guides/{es,en}/<topic>/[<subtopic>/]<id>.mdx`.
- Entry identity comes from the frontmatter `id` (custom glob `generateId`), never from the path or the slug. A loader wrapper (`byDeclaredId`) fails the load when two files declare the same id; Astro's glob loader would otherwise let one silently replace the other.
- Guide frontmatter: `id`, `slug`, `order`, `topic`, `subtopic?`, `section?`, `title`, `description`, `created`, `lastUpdated`, `cover?`. Migrated as `created = publishDate`, `lastUpdated = updatedDate ?? publishDate`, `category → section`.
- Topics and subtopics: `id`, `slug`, `order`, `title`, `description`, `icon`, `sections?` (`{ id, title }[]`, display order); subtopics add `topic`.
- `devpedia/src/lib/content-model.ts` (pure, no `astro:content`): types, path builders, `ContentIndex` (lookups, `routes(lang)`, `alternatesOf(kind, id)` for hreflang by id) and `validateContentModel`. `devpedia/src/lib/content.ts` loads the collections, validates and fails the build on any error.
- Validation rules: required and kebab-case ids/slugs, positive integer orders, unique ids per content type, valid topic/subtopic/section references, subtopic belongs to the guide's topic, every declared section has guides, unique slug and order per parent, guide/subtopic slug collisions, reserved Spanish root slugs (`en`, `_astro`, `pagefind`), empty topics/subtopics, `lastUpdated >= created`, ES/EN pairing by id, and ES/EN structural consistency (parents, order, section, icon, section ids). Claude Code under AI Engineering is an explicit invariant.
- Routes: `devpedia/src/pages/[...path].astro` (ES) and `devpedia/src/pages/en/[...path].astro` (EN) generate `/<topic>/`, `/<topic>/<guide>/`, `/<topic>/<subtopic>/`, `/<topic>/<subtopic>/<guide>/`. `prerenderConflictBehavior: 'error'` makes URL clashes fail the build.
- Provisional UI: `HubPage` (subtopics plus guides grouped by section), `GuidePage` (breadcrumb, title, lead, last updated, body in `.prose-guide` with `data-pagefind-body`), `Breadcrumb`, and a topic list on both homes. Titles use `<title> | DevPedia`.
- MDX components copied into `devpedia/src/components/mdx/` (`Callout`, `MermaidDiagram`, `ClassDiagram`, `DiagramFigure`, `DiagramZoom`, `PermissionCascade`, `StepFlow`, `uml/*`), reading their copy from `devpedia/src/i18n`. `Icon` stays a shared primitive. The scroll-reveal class was dropped from the copies.
- Markdown pipeline: MDX integration, shared Shiki theme (`../src/lib/shiki-theme.ts`), and DevPedia copies of the rehype plugins (`rehype-external-links.ts`, `rehype-guide-enhancements.ts`, which detects English through `/content/guides/en/`).
- All 136 MDX files migrated (68 ES, 68 EN) with a one-off, unversioned script. Only the frontmatter, component imports and internal links changed; bodies are otherwise identical. All internal links point to DevPedia URLs; the only remaining `blog` string is an external `claude.com/blog` URL.
- `scripts/check-blog-links.mjs` accepts an optional build directory (`node scripts/check-blog-links.mjs devpedia/dist`).
- `yaml` added as a devDependency (it was already installed transitively) to parse content in tests.
- `test/devpedia/content-model.test.ts`: 22 tests over the real content (model is valid, 68/68 guides, approved hub URLs, agreed slugs and sections, Claude Code placement, unique URLs, no `/blog` links, content links resolve within the same edition) plus one test per validation rule.

## M2 — Decisions and deviations

- Guide IDs are explicit conceptual identifiers. During the initial migration many intentionally match the English slug, but IDs must not be automatically derived from slugs going forward. `id`, `slug` and `order` remain independent concepts.
- Migration exceptions to the English-slug match, chosen to keep ids globally unique without relying on parent context: the 23 GoF patterns use `<name>-pattern` (`state-pattern`, `proxy-pattern`…), and Claude Code guides use a `claude-code-` prefix (`claude-code-permissions`, `claude-code-mcp`…), except `what-is-claude-code` and `spec-driven-development`. `user-acceptance-testing` drops the `-uat` suffix of its slug.
- Section ids: Architecture `fundamentals`, `domain-and-structure`, `communication-and-data`, `operations`, `decisions`; Testing `fundamentals`, `unit-testing`, `test-levels`, `non-functional`; Claude Code `getting-started`, `context-and-control`, `extension`, `teams-and-workflows`; Design patterns `creational`, `structural`, `behavioral`, `reference`. Section ids are unique within their owner, not globally.
- `section` is optional. "Qué son los patrones de diseño" (`what-are-design-patterns`) keeps no section, as it had no category; hub pages list sectionless guides first, without a heading.
- Subtopic titles follow the approved taxonomy: ES `Principios` / `Patrones`, EN `Design principles` / `Design patterns` (sentence case).
- Order is unique per parent and keeps the original `NN` numbers, so Claude Code's section order (`getting-started` holds 1, 2, 3 and 12) differs from the numeric order.
- `created`/`lastUpdated` are not required to match across editions (the English edition was published later).
- `prerenderConflictBehavior` does not catch duplicate content ids, which is why the loader wrapper exists.
- No slug deviates from the agreed list; no collision was found.

## M2 — Known debt

- MDX components, rehype plugins and the prose/callout/table/code styles are copies of the portfolio's. The portfolio originals go away at cutover (M7). SonarCloud may flag the duplication until then.
- Provisional UI: no table of contents, heading anchors or previous/next. (Search UI, sitemap and favicon were added in M3.)
- No custom 404 page.

## Verification baseline (M2)

- `npm run check`: exit 0. Portfolio 0 errors, 0 warnings, 20 hints. DevPedia 0 errors, 0 warnings, 0 hints.
- `npm test`: 102 passed, 3 failed (105). The 3 failures are the known legacy ones in `test/content/blog-i18n.test.ts`:
  - `blog topics > exist in both languages under the same ids`
  - `blog topics > give the English topics their own URL segment`
  - `blog articles > map one to one across languages`

  That test belongs to the old blog; it stays untouched until cutover. Criterion: no new failures.
- `npm run build`: OK (154 pages). Portfolio `dist/` is identical to the pre-M2 build except for the key order inside `pagefind/pagefind-entry.json` (same hashes).
- `npm run build:devpedia`: OK, 152 pages (2 homes; per language 4 topics, 3 subtopics, 68 guides). Pagefind: 136 pages, 2 languages.
- `node scripts/check-blog-links.mjs`: OK across 154 pages.
- `node scripts/check-blog-links.mjs devpedia/dist`: OK across 152 pages.
- No `blog` directory or `/blog` route in `devpedia/`; hreflang alternates resolve by id.

## M3 — Implemented

- Branding: `Wordmark.astro` (open-book mark + "Dev**Pedia**", "Pedia" in accent). Descriptor "A handbook for Software Engineering" stays English in both editions (`lang="en"` on it). UI localized (Temas/Topics, Buscar/Search, guías/guides).
- `SiteHeader.astro` (sticky): wordmark → home, `Temas`/`Topics` (→ `<home>#topics`, the home topic list), `Buscar`/`Search` (opens `Search.astro`), ES/EN switcher (flags hidden below `sm`), `ThemeToggle`. No About me link. Fits at 360px without horizontal scroll.
- `SiteFooter.astro`: wordmark, descriptor, "Creado por / Created by Camila Sabino" linking to `AUTHOR_URL`, GitHub icon (`AUTHOR_GITHUB_URL`, the same profile URL the portfolio already uses). No portfolio `Footer`/`Nav`/`Layout`/copy is imported.
- `Search.astro`: port of the portfolio's Pagefind overlay with DevPedia copy and ids (`search-*`); reuses `src/lib/search-relevance.ts`. Guides expose `data-pagefind-meta="topic"` = "Topic › Subtopic › Section", shown above each result.
- `HomePage.astro`: shared by `/` and `/en/` (pages are thin wrappers). Home content itself is still the M2 placeholder.
- `TopicList` shows each topic's icon in its topic color and carries `id="topics"`.
- Shared styling: new `src/styles/surfaces.css` (surface/card/border/overlay/text/diagram tokens for both themes + the `:focus-visible` ring), imported by both `src/styles/global.css` and `devpedia/src/styles/global.css`. DevPedia's duplicated token block was removed; it adds the portfolio's graph-paper grid, `::selection` and smooth scroll with `scroll-padding-top`.
- Topic visual configuration: `devpedia/src/lib/topic-visuals.ts` is the single source of truth by conceptual id: `TOPIC_VISUALS` (`cover`, `badge`, `text` classes) for `architecture` (sky), `design` (violet), `testing` (green), `ai-engineering` (yellow); `SUBTOPIC_COVERS` for `claude-code`, `design-principles`, `design-patterns`; `topicVisual(id)` throws on a missing topic; `coverOf(topicId, subtopicId?)`. Icons stay in the topic YAML (content model unchanged).
- Config (`devpedia/src/config.ts`): `AUTHOR_GITHUB_URL`, `DEFAULT_OG_IMAGE`, `HOME_TITLE` ("DevPedia — A handbook for Software Engineering"), `pageTitle(title)` ("<title> | DevPedia").
- Metadata (`BaseLayout`): props `image`, `article`, `jsonLd`. Canonical, hreflang (es/en/x-default→es), `og:url`, `og:image`, JSON-LD URLs and sitemap/robots are all built from `SITE_URL` via `absoluteUrl`. OG: `og:site_name` DevPedia, localized title/description, `og:locale` + `og:locale:alternate`, `og:image` with width/height/type(/alt), `og:type` `article` on guides with `article:published_time`/`modified_time`/`section`; Twitter `summary_large_image`. Home descriptions are localized and describe DevPedia as a structured handbook.
- Social image per page: home → `DEFAULT_OG_IMAGE`; topic/subtopic → `coverOf`; guide → `guide.cover ?? coverOf(topic, subtopic)`.
- Structured data (`devpedia/src/lib/seo.ts`, pure): `WebSite` on both homes (creator Person Camila Sabino); `TechArticle` on guides (`isPartOf` WebSite DevPedia, author Person, dates from `created`/`lastUpdated`, `articleSection` = subtopic or topic title); `BreadcrumbList` on topics, subtopics and guides, rooted at DevPedia, ending at the current page. No `BlogPosting`, no `SearchAction`, no Organization publisher.
- `devpedia/src/pages/sitemap.xml.ts`: homes + every route of both editions, reciprocal `xhtml:link` alternates by id, `lastmod` = guide `lastUpdated`. `devpedia/src/pages/robots.txt.ts`: `Allow: /` + `Sitemap: <SITE_URL>/sitemap.xml`.
- Favicon: `devpedia/public/favicon.svg` (open book, teal on `#08090b`), `favicon.ico` (16/32/48, PNG payloads), `apple-touch-icon.png` (180×180); linked from `BaseLayout`.
- Assets (`devpedia/public/`):
  - `og/devpedia.png` — 1200×630 PNG, ~170 KB. Wordmark, `// A handbook for Software Engineering`, `$ topics architecture design testing ai-engineering`, grid + teal glow. No domain. Rendered from HTML with headless Chrome (Space Grotesk / JetBrains Mono).
  - `covers/<id>.jpg` — 1200×630: `architecture`, `testing`, `ai-engineering`, `claude-code`, `design-principles`, `design-patterns` (copies of the portfolio covers, renamed by id) and new `design` (composite: principles cover's left panel + patterns cover's center/right panels, seam feathered in the dark gap).
- Tests: `test/devpedia/seo.test.ts` (10 tests: JSON-LD builders, sitemap on an arbitrary origin, image types, every topic has visuals, cover files exist, cover fallback).

## M3 — Decisions and deviations

- The header's Topics item links to the home's topic list anchor: there is no topics index page yet, and building one belongs to M4.
- Search was ported (not redesigned) so the header's Search item works; result presentation redesign, if any, is later work.
- Topic icons remain in the content YAML rather than in `topic-visuals.ts`, to avoid changing the M2 content model; the ES/EN icon consistency is already validated.
- The Spanish home description uses "handbook" as the product category ("Un handbook estructurado…").
- The portfolio build is byte-identical to pre-M3 except the CSS file hash in each HTML and the order of `:root` blocks inside that CSS (merged token values verified identical).

## M3 — Known debt

- `guide.cover` (no guide uses it yet) is announced as 1200×630; a custom guide cover of another size would need its dimensions.
- The `design` cover is a composite of two existing renders, a first version.
- `.card-surface`, prose/callout/table/code styles are still duplicated between portfolio and DevPedia (removed from the portfolio at M7).
- Light theme was not visually re-reviewed page by page; it uses the same shared tokens as before.

## Verification baseline (M3)

- `npm run check`: exit 0. Portfolio 0 errors, 0 warnings, 20 hints. DevPedia 0 errors, 0 warnings, 0 hints.
- `npm test`: 112 passed, 3 failed (115). Only the 3 known legacy failures in `test/content/blog-i18n.test.ts`.
- `npm run build`: OK (154 pages); HTML identical to pre-M3 except the CSS hash.
- `npm run build:devpedia`: OK, 152 pages + `sitemap.xml` + `robots.txt`. Pagefind: 136 pages, 2 languages.
- `node scripts/check-blog-links.mjs`: OK across 154 pages. `node scripts/check-blog-links.mjs devpedia/dist`: OK across 152 pages.
- SEO sweep over `devpedia/dist` (every page): canonical = `SITE_URL` + path; hreflang reciprocal and resolving (88 pages have different ES/EN slugs); JSON-LD parses (2 `WebSite`, 136 `TechArticle`, 150 `BreadcrumbList`, root DevPedia); `og:image` files exist; titles follow the format; no Blog/Post/Artículo in visible UI; sitemap = the 152 pages, no `/blog`; robots points to the sitemap; favicon/OG files served (preview: `/favicon.ico` 200). Only `/blog` hit: the external `claude.com/blog` link. Rebuilt with `SITE_URL=https://handbook.example.org`: no `devpedia.camilasabino.dev` left in the output.

## M4 — Implemented

- Home (`HomePage.astro`, shared by `/` and `/en/`):
  - Hero: `<h1>` with the `Wordmark`, the descriptor as `// A handbook for Software Engineering` (`lang="en"`), a localized lead (ES "Entendé los conceptos, las decisiones y los trade-offs que hay detrás de construir mejor software." / EN "Understand the concepts, decisions and trade-offs behind better software.") and one CTA, `Explorar temas` / `Explore topics`, to `#topics`. No author in the hero; no `Start learning`.
  - `Explorar por tema` / `Explore by topic` (`#topics`, still the header's Topics target): 1 column on mobile, 2 from `sm`, one `TopicCard` per topic in `order`.
- `TopicCard.astro`: topic icon in its topic badge color, title (`<h3>` link), description, subtopic names as a secondary line when the topic has subtopics (Design, AI Engineering), localized guide count (`guideCount`, including subtopics) in the topic color. No dates, author or latest guide.
- Topic and subtopic pages (`HubPage.astro`): breadcrumb with the current page (`DevPedia › Topic`, `DevPedia › Topic › Subtopic`), topic-colored icon badge, `<h1>`, description, guide count. Then:
  - a topic with subtopics shows `Subtemas` / `Subtopics` as `SubtopicCard`s. The topic page is the area's index: it links into each subtopic and does not repeat its guides;
  - the node's own guides, through `GuideList`.
- `SubtopicCard.astro`: icon, title (`<h3>` link), description, guide count and, when the subtopic declares sections, a `<nav>` with one link per section to `<subtopic>#<section-id>`.
- `GuideList.astro`: one block per section in the declared section order, guides sorted by `order`; sectionless guides first without a heading (only `what-are-design-patterns` today; Design principles has no sections, so it renders as one sequence). Section `<h2>` in a left column from `lg`, stacked below. Each guide shows a sequence number (position in the page, `aria-hidden`; the `<ol>` carries the order), title and description. Each section block has `id=<section id>`.
- `devpedia/src/lib/hub.ts` (pure): `groupBySection(owner, guides)`, the grouping/ordering rule shared by `GuideList` and `SubtopicCard`. Tests: `test/devpedia/hub.test.ts` (3).
- Cards and guide rows are clickable through a stretched `::after` on the title link, so each link's accessible name is only the title; the container draws the focus ring through `has-[…:focus-visible]`, and the link's own ring is removed by `.stretched-link:focus-visible` in `devpedia/src/styles/global.css` (unlayered, to beat the global `:focus-visible` rule).
- `Breadcrumb.astro`: separator `›`, optional `current` prop (plain text, `aria-current="page"`). Hubs pass it; guide pages do not yet.
- `TopicList.astro` removed (replaced by the home's topic grid). i18n: `home.lead`, `home.cta`, `home.topicsHeading` renamed to the section title, `hub.sectionsLabel`; `home.status` ("En construcción") removed.

## M4 — Decisions and deviations

- Topic pages with subtopics list the subtopics, not their guides, to avoid showing the same guide on two hubs; section links on each `SubtopicCard` give a direct way into Design patterns and Claude Code. AI Engineering therefore shows a single card.
- Subtopic cards keep their natural height (`items-start`); stretching made the section-less Design principles card look empty next to Design patterns.
- Guide numbers are display positions, not `order` values (Claude Code's `getting-started` holds orders 1, 2, 3 and 12).
- No UI label for sectionless guides; inventing one ("Introduction") would add a section the model does not have.
- Global header: below `sm`, nav item and language link padding and the controls gap were reduced (`SiteHeader.astro`). At 320px every page overflowed by 1px (ES) or 8px (EN); M3 had verified 360px only. No change from `sm` up.
- Guide pages only change through the shared breadcrumb separator (`/` → `›`).

## M4 — Known debt

- Guide pages keep the M2/M3 layout (M5).
- No custom 404 page.

## Verification baseline (M4)

- `npm run check`: exit 0. Portfolio 0 errors, 0 warnings, 20 hints. DevPedia 0 errors, 0 warnings, 0 hints.
- `npm test`: 115 passed, 3 failed (118). Only the 3 known legacy failures in `test/content/blog-i18n.test.ts`.
- `npm run build`: OK (154 pages). `npm run build:devpedia`: OK, 152 pages; Pagefind 136 pages, 2 languages.
- `node scripts/check-blog-links.mjs`: OK across 154 pages. `node scripts/check-blog-links.mjs devpedia/dist`: OK across 152 pages (includes the new `#<section>` anchors).
- Built hubs checked against the content files (14 pages, ES and EN): displayed count = topic total including subtopics / subtopic total; guide order = declared section order, then `order`.
- No horizontal overflow on home and every topic/subtopic page (ES and EN) at 320, 360, 390, 768, 1024 and 1280px.
- Visual review: desktop home ES, Architecture, Design, Design patterns, AI Engineering, Claude Code; mobile home ES, Claude Code, EN Design; light mode on EN home and EN Design; keyboard focus on cards and guide rows.

## M5 — Implemented

- `GuidePage.astro` structure: breadcrumb `DevPedia › Topic [› Subtopic] › Guide` (the guide title is the `aria-current` crumb, truncated to one line; labels and URLs from `ContentIndex`) → context line (topic icon in the topic color, section title linking to `<parent hub>#<section>`, `Guía n de N` / `Guide n of N`) → `<h1>` (only one on the page) → description → `Actualizado sept 2026 · 12 min de lectura` / `Updated Sep 2026 · 12 min read` → inline TOC (below `lg`) → body (`.prose-guide`, `data-pagefind-body`) → share → previous/next.
- Desktop (`lg`+): two columns, body `minmax(0,1fr)` and a 14rem sticky TOC column. The column is kept even when a guide has no TOC, so the body has the same position and width on every guide. Running text stays capped at `--guide-measure` (64ch); code, tables and diagrams use the full body column.
- `devpedia/src/lib/guide.ts` (pure):
  - `guideSequence(index, lang, id)`: position, total, previous, next within the guide's direct parent (subtopic, else topic), in hub order (`groupBySection`: sectionless first, declared section order, then `order`). No crossing into other topics/subtopics, no wrap-around.
  - `readingMinutes(body)`: the old blog's formula (165 wpm prose, 12.5 Java lines/min, 18 s per Mermaid diagram, min 1), computed from the raw MDX body.
  - `formatMonthYear(date, lang)`: `Intl.DateTimeFormat` (`es` / `en-US`, `month: 'short'`, `year`, UTC).
  - `tocEntries(headings)`: h2 + h3 from the rendered headings; empty below 2 entries.
- `GuideToc.astro`: `sidebar` (sticky `<nav>`) and `inline` (`<details>`, closed by default, list capped at 60dvh) variants of the same anchor list; h2/h3 as a two-level outline. Script (progressive): current section via `aria-current="location"`, smooth scroll honoring reduced motion, focus moves to the target heading, the inline block closes after a jump, and a one-time correction on `scrollend` because lazily rendered Mermaid diagrams push headings down during the scroll.
- Heading anchors: ids from Astro's slugger at build time (unicode kept, duplicates suffixed). A page script appends a `#` permalink (`Enlace a «…»` / `Link to “…”`) to every h2–h4 and sets `tabindex="-1"` so the TOC can focus it. Without JS the ids and TOC links still work.
- `GuidePager.astro`: `<nav aria-label="Guías de <parent>" / "<parent> guides">`, cards with `rel="prev"`/`rel="next"`, label `Anterior`/`Siguiente` (`Previous`/`Next`) plus the guide title; a missing side is omitted.
- `GuideShare.astro`: LinkedIn and X are plain links built at build time from the canonical URL (work without JS, open in a new tab, announced in their accessible names); "Copiar enlace" / "Copy link" is `hidden` until the script enables it, uses the shared `src/lib/clipboard.ts` and reports through a `role="status"` region. No likes, no counters, no KV, no `/api/*`.
- i18n (`guide.*`): `updated`, `readingTime`, `position`, `toc`, `headingAnchor`, `pager`, `share`. `guide.lastUpdated` removed.
- `Breadcrumb.astro`: current crumb truncates instead of wrapping into a column.
- Tests: `test/devpedia/guide.test.ts` (11: sequence order across Claude Code sections, boundaries, sectionless first, never leaves the parent for any guide, identical ES/EN sequences, reading time, month/year formatting, TOC filtering). Real-content loading moved to `test/devpedia/real-content.ts`, shared with `content-model.test.ts`.

## M5 — Decisions and deviations

- Sequence order is the hub's display order, not the raw `order` number: Claude Code's `getting-started` holds orders 1, 2, 3 and 12, so order 12 is guide 4 of 12 and leads into `context-and-control`. `Guía n de N` therefore matches the numbers on the hub.
- Spanish month abbreviation comes from CLDR, which gives `sept` (not `sep`); it was kept rather than overriding the locale data.
- The context line omits the section label when it equals the guide title (section overview guides such as "Patrones creacionales"), and omits the position when a parent has a single guide (none today).
- Share sits at the end of the guide, not in the header, to keep the header about the content.
- No copy-to-clipboard button on code blocks: it did not exist before and was out of scope.
- Reading time uses the same rates in both languages (as the old blog did).

## M5 — Known debt

- Mermaid diagrams render lazily without a reserved height, so a native hash link into a guide (not through the TOC) can land short of the heading when diagrams sit above it. The TOC corrects for it; plain anchors do not.
- The heading permalink is added client-side (Astro's slugger runs after user rehype plugins).
- The breadcrumb repeats the guide title right above the `<h1>` (as required); on narrow screens it is truncated to one line.
- No custom 404 page.

## Verification baseline (M5)

- `npm run check`: exit 0. Portfolio 0 errors, 0 warnings, 20 hints. DevPedia 0 errors, 0 warnings, 0 hints.
- `npm test`: 126 passed, 3 failed (129). Only the 3 known legacy failures in `test/content/blog-i18n.test.ts`.
- `npm run build`: OK. `npm run build:devpedia`: OK; Pagefind 136 pages, 2 languages.
- `node scripts/check-blog-links.mjs`: OK across 154 pages. `node scripts/check-blog-links.mjs devpedia/dist`: OK across 152 pages (includes every TOC anchor).
- Sweep over the 136 built guides: exactly one `<h1>`; TechArticle and BreadcrumbList (rooted at DevPedia) present; updated date, reading time and position rendered; 124 with TOC, 12 without (guides with fewer than 2 h2/h3); 116 with both pager sides, 10 with only one; no `/blog` links; no byline, avatar or published date in the UI.
- Visual review (dev server): desktop ES Architecture (architectural drivers), Testing (AAA), Design patterns (creational patterns, no TOC), EN Claude Code (spec-driven development, last of its sequence); mobile 375px ES SOLID (long, code, inline TOC), EN architectural drivers (long title, tables, Mermaid + zoom, pager, share) including light theme. No horizontal overflow on the checked pages.

## M6 — Implemented

- Search (`Search.astro`, rewritten): native `<dialog>` opened with `showModal()` from the header's `#search-trigger`. Background inert (no hand-written focus trap), initial focus on the input (`aria-label`, 16px on mobile to avoid iOS zoom), `ArrowDown` from the input to the first result, `ArrowUp`/`ArrowDown` between results, `ArrowUp` on the first result back to the input, Escape through the dialog's own `cancel`, backdrop click and close button; every close resets the query and returns focus to the trigger. Scroll lock on `<html>`; closed on `pageshow` from the back/forward cache. Full screen below `sm`, centered panel from `sm`.
- States (localized, `ui.search.*`): idle hint (`idle`), `loading` (only after 150 ms), empty (`empty` + `emptyHint`), `unavailable` (Pagefind failed to load, e.g. `astro dev`). A `role="status"` region announces the result count, the empty message or the error. "Show all" / Enter lists every result and moves focus to the first one.
- Results are real links (`<ul>` of `<a>`), named by the title (`aria-labelledby`) and described by context + excerpt (`aria-describedby`). Order: title, context line, Pagefind excerpt (with `<mark>`, styled again in `devpedia/src/styles/global.css`; the M3 port had lost the style). Pagefind's excerpts are used as is; no custom ranking. `src/lib/search-relevance.ts` still filters Pagefind's loose matches (M3).
- Search scope: guides index `<article>` (title `<h1>`, description, body) with `data-pagefind-ignore` on the context line, dates, inline TOC and share footer; topic and subtopic hubs index only their `<header>` (title and description, the guide count ignored), not the guide list. Mermaid source (`<pre class="mermaid-source">`) and the diagram zoom button are ignored too. 150 pages indexed (136 guides + 14 hubs), 8819 words (was 9887).
- Result metadata (Pagefind meta, outside the indexed element): `context`, `id` (conceptual id), `kind` (`guide` / `topic` / `subtopic`). `devpedia/src/lib/search.ts` → `searchContext(index, lang, kind, id, topicLabel)` builds the context from `ContentIndex`: guide `Topic › Subtopic › Section` (only the levels it has; a section titled like the guide is omitted), subtopic `Topic`, topic the localized `Tema` / `Topic`.
- Language isolation: Pagefind's per-language index, chosen from `<html lang>`. Verified: queries from ES pages return only `/…` results, from `/en/` only `/en/…`.
- Analytics (`devpedia/src/lib/analytics.ts`): typed event vocabulary, builders (`guideView`, `topicView`, `pageOf`), markup helpers (`trackAttributes`, `viewAttributes`, `readTracked`), `track()` and `initAnalytics()`. BaseLayout runs `initAnalytics()` once per page load from one module script: it sends the `<body data-track-view>` event and installs a single delegated click listener for any `[data-track]` element. Search calls `track('search')` directly; nothing else has its own listener.
- Events and parameters (final):
  - `guide_view`: `id`, `topic_id`, `subtopic_id` (only under a subtopic), `lang`.
  - `topic_view`: `id`, `kind` (`topic` | `subtopic`), `topic_id` (subtopics only), `lang`.
  - `search`: `lang`, `result_count`.
  - `search_result_click`: `id`, `kind`, `lang`, `position` (1-based, in the rendered list).
  - `next_guide_click`: `from_id`, `to_id`, `lang` (Next only; Previous is not tracked).
  - `share`: `method` (`copy` | `linkedin` | `x`), `id`, `lang`.
  - `language_change`: `from`, `to`, plus `id` and `kind` on topic, subtopic and guide pages (not on the homes). Only the link to the other language carries it.
- `search` fires once per settled query: after 1 s without typing, or immediately on Enter, "Show all", a result click (before `search_result_click`) or closing the dialog; the same normalized query is not sent twice in a row. Empty queries and Pagefind failures send nothing.
- Debugging: `localStorage['analytics-debug'] = 'true'` logs every event to the console with or without GA.
- `BaseLayout` prop `view` (the page's `ViewEvent`); `SiteHeader` prop `page` (`{ id, kind }`); `GuidePager` prop `guideId` and `Link.id`; `GuideShare` prop `id`.
- Copy: trigger/input label `Buscar guías y temas` / `Search guides and topics`; new `inputLabel`, `resultsLabel`, `idle`, `loading`, `topicLabel`; the empty message no longer contains HTML entities.
- Tests: `test/devpedia/search.test.ts` (6: context per level, omitted levels, section repeat, hubs, every route of both editions has a context) and `test/devpedia/analytics.test.ts` (11: conceptual ids not slugs, ES/EN parity, topic vs subtopic kind, attribute round-trip, malformed/unknown events ignored, `track` no-op/forward/swallow).

## M6 — Decisions and deviations

- Privacy: the `search` event does not send the query (nor its length). A search box receives arbitrary text, which can include personal data; `result_count` and `lang` are enough to measure usage and zero-result rates. The query is only kept in memory to de-duplicate events. No event carries titles, slugs, paths, content or anything user-entered.
- `search_result_click` and `language_change` add `kind`: ids are unique per content type, not globally, so `id` alone could be ambiguous. `topic_view` uses `kind` as the explicit topic/subtopic discriminator.
- `guide_view` / `topic_view` are product events on top of GA's automatic `page_view`, which stays the only page view. The home sends no custom view event.
- No wrapper for GA: when `GA_MEASUREMENT_ID` is empty (or outside production / the `SITE_URL` host / with `analytics-excluded`), `window.gtag` is never defined and `track` does nothing. No fallback to the portfolio's measurement id.
- Hubs are indexed with their title and description only. With Pagefind's default ranking they appear in results but usually below guides that mention the term more often; no custom ranking was added.
- The search input keeps the global `:focus-visible` ring (the previous `focus:outline-none` never won over the unlayered global rule); it was kept as the visible focus indicator.
- M3's `data-pagefind-meta="topic"` was renamed to `context`; the `pagefind-body` moved from `.prose-guide` to `<article>` so titles and descriptions are searchable.

## M6 — Known debt

- Hubs rank below guides for their own name (e.g. "testing"); tuning would need `data-pagefind-weight` or ranking options.
- Hand-authored UML SVG text and diagram captions are still indexed (captions on purpose).
- Search result excerpts can join adjacent blocks without a space (e.g. a figcaption followed by a paragraph), as Pagefind extracts them.
- The `search` event is not sent when a visitor leaves the page (not through a result) within 1 s of typing.

## Verification baseline (M6)

- `npm run check`: exit 0. Portfolio 0 errors, 0 warnings, 20 hints. DevPedia 0 errors, 0 warnings, 0 hints.
- `npm test`: 143 passed, 3 failed (146). Only the 3 known legacy failures in `test/content/blog-i18n.test.ts`.
- `npm run build`: OK (154 pages, Pagefind 136). `npm run build:devpedia`: OK, 152 pages; Pagefind 150 pages, 2 languages.
- `node scripts/check-blog-links.mjs`: OK across 154 pages. `node scripts/check-blog-links.mjs devpedia/dist`: OK across 152 pages.
- Manual, Search ES (preview): queries with results (patrones, testing, claude code, estrategia), no results (zzqxw), topic/subtopic/guide results, long titles on 360px, keyboard (arrows, Enter, Show all), Escape, focus back on the trigger, background inert. Search EN: observer, chain responsibility, proxy; same checks. Dark and light. No horizontal overflow in the dialog at 360px.
- Manual, GA disabled (default build): no `googletagmanager`/`google-analytics` in `devpedia/dist`, no request to Google while using Search, Share (copy/LinkedIn/X), Next and the language switcher, no console errors or warnings.
- Manual, GA enabled (build with a test id and `SITE_URL` = the preview origin): gtag script loaded; one `page_view` and one `guide_view` per guide load; `topic_view` on a topic and on a subtopic; `search` then `search_result_click` with the right position; `share` ×3, `next_guide_click`, `language_change` each sent once, with conceptual ids (ES and EN `guide_view` share the same `id`); Previous and the current-language link send nothing.
- No `/api/*`, KV `ENGAGEMENT`, likes or view counts referenced in `devpedia/src` or `devpedia/dist`. Portfolio and `/blog` sources untouched.

## M7 — Implemented (hard cutover)

- Hard cutover: the portfolio no longer contains the old blog. `/blog/*`, `/en/blog/*`, `/rss.xml` and `/en/rss.xml` are not built and return 404. No redirects, aliases or fallback routes; `/blog` stays free for a future editorial blog.
- Removed routes: `src/pages/blog/`, `src/pages/en/blog/`, `src/pages/rss.xml.ts`, `src/pages/en/rss.xml.ts`.
- Removed content system: `src/content.config.ts` and the `articles`/`articlesEn`/`topics`/`topicsEn`/`subtopics`/`subtopicsEn` collections (136 MDX files, 10 topic and 2 subtopic YAML files). Verified first that DevPedia holds 68 ES + 68 EN guides, 4 topics and 3 subtopics per language, no `/blog` links and every MDX component used by the guides.
- Removed implementation: `src/components/blog/`, `src/layouts/BlogLayout.astro`, `src/lib/{blog,rss,covers,i18n,rehype-article-enhancements,rehype-external-links}.ts`; assets `public/covers/*` and `src/assets/images/og-blog.webp`; the orphaned `heart` icon; blog-only props (`SectionHeading` `as`/`onImage`, `BracketTitle` `compact`, `Footer` `widthClass`/`paddingClass`).
- Moved into DevPedia (the portfolio no longer consumes them): `src/lib/{shiki-theme,clipboard,search-relevance}.ts` → `devpedia/src/lib/`, and their tests `test/lib/*` → `test/devpedia/`. Still shared from the portfolio: `Icon`, `Flag`, `ThemeToggle`, `src/styles/theme.css`, `src/styles/surfaces.css`.
- Portfolio integration: `src/config.ts` holds `DEVPEDIA_URL` (`https://devpedia.camilasabino.dev`) and `devpediaHome` (ES `/`, EN `/en/`); the domain appears nowhere else. `site.blog` / `site.blogPromo` in `es.ts`/`en.ts` became `site.devpedia` and `site.devpediaPromo`.
  - Landing (`Home.astro`): second CTA `Explorar DevPedia` / `Explore DevPedia` with an outbound arrow; meta description mentions DevPedia instead of "my articles".
  - Nav: desktop pill `DevPedia ↗` and a `DevPedia` row in the mobile menu, both external links with an accessible name that says so. No new dropdown.
  - Footer: `Inicio · Sobre mí · DevPedia ↗` (absolute links get the arrow).
  - About me: `BlogPromo` renamed to `DevPediaPromo`, a project card: host of `DEVPEDIA_URL` in the terminal bar, `DevPedia`, `// A handbook for Software Engineering` (`lang="en"`), a short localized description and `Explorar DevPedia` / `Explore DevPedia`.
- `Layout.astro`: removed the RSS `<link>`, `BlogPosting` and `BreadcrumbList` JSON-LD, `og:type` article meta and the `article`, `alternates`, `breadcrumbJsonLd` and `grid` props; `image` only accepts imported images. The portfolio emits no structured data (it had none of its own). Other metadata unchanged.
- Sitemap (`src/pages/sitemap.xml.ts`): only `/`, `/en/`, `/about-me/`, `/en/about-me/` with reciprocal alternates.
- CSS (`src/styles/global.css`): removed `--blog-*` tokens, `.prose-blog`, callouts, `.table-scroll`, heading anchors, Shiki overrides, `#blog-search-results`, `.card-surface`, `.technical-content-wrapper`, `.grid-veil-strong`, the soft-grid mode and the input autofill rule (the only input was the blog search). `.grid-veil` keeps its bleed as a literal value.
- Astro config: the portfolio no longer registers MDX, the Shiki theme or rehype plugins; the build no longer runs Pagefind.
- Worker/KV: removed `src/worker/`, `test/worker/`, `test/env.d.ts`. `wrangler.jsonc` is assets only (`name`, `compatibility_date`, `assets.directory: ./dist`): no `main`, no `ASSETS` binding, no `ENGAGEMENT` KV. `vitest.config.ts` is plain Vitest; `tsconfig.json` only excludes `dist` and `devpedia`. `.env.example` (metrics only) removed; `.gitignore` drops `public/pagefind/` and `metrics.json` (keeps `.dev.vars` and `.wrangler/`). The real KV namespace in Cloudflare was not touched.
- Dependencies: removed `@cloudflare/vitest-pool-workers` (lockfile drops only its subtree: wrangler, miniflare, workerd…, no version changes) and the `workerd` entry in `allowScripts`.
- Tests: removed `test/content/blog-i18n.test.ts` (the 3 known legacy failures) and the 7 Worker test files. `clipboard.test.ts` now stubs `document`/`navigator` with `vi.stubGlobal` (Node's `navigator` is getter-only; it used to run in workerd).
- Scripts: `scripts/check-blog-links.mjs` → `scripts/check-links.mjs`; `scripts/check-en-language.mjs` now scans DevPedia's English guides and the rendered `/en/` pages of both builds; removed `scripts/blog-i18n-report.mjs` and `scripts/kv-metrics.mjs`. `package.json`: `build` is `astro build`; removed `dev:worker` and `metrics`; added `check:links`, `check:links:devpedia`, `check:en-language`.

## M7 — Decisions and deviations

- DevPedia links from the portfolio open in the same tab (same ecosystem); the outbound arrow and the accessible name (`… (sitio externo)` / `… (external site)`) mark them as external. The landing CTA has no `aria-label`, so its accessible name matches the visible text.
- The three helpers moved into `devpedia/` were a scope addition: keeping them under the portfolio's `src/lib` would have left portfolio files the portfolio does not use.
- DevPedia output is unchanged against a pre-M7 build (HTML identical except the CSS file hash). The CSS gains `.italic{font-style:italic}`, because Tailwind now scans `shiki-theme.ts` inside `devpedia/src`; no element uses it.
- `npm run check` DevPedia hint: `document.execCommand` deprecated in `clipboard.ts` (the fallback path; it was one of the portfolio's hints before the move).
- Repository documentation (`README.md`, `CLAUDE.md`, `AGENTS.md`, `docs/BLOG_TRANSLATION_PROGRESS.md`, `docs/EDITORIAL_GUIDELINES.md`, `docs/EN_EDITORIAL_GUIDE.md`) still describes the blog, the Worker and removed scripts. Left for M8 (documentation).
- Unused before M7 and left alone: `.animate-pulse-dot`, the `runner`/`globe`/`calendar`/`clock` icons, `SectionHeading` `align`, `BracketTitle` `as`.

## M7 — Intentional legacy references

- `devpedia/src/lib/content-model.ts`: comment contrasting the model with "the old blog".
- `test/devpedia/content-model.test.ts`: "never links to the old blog" guard (`/blog` regex).
- `test/devpedia/seo.test.ts`: asserts JSON-LD is not `BlogPosting`.
- Guides: the external `https://claude.com/blog/…` link; "Para un blog técnico" / "For a technical blog" as prose in the architecture-decisions guide.
- `article`/`Article` as HTML element, `og:type` and `TechArticle` (DevPedia and `Experience.astro`).
- This file's history and the docs listed above (M8).

## Verification baseline (M7)

- `npm run check`: exit 0. Portfolio 0 errors, 0 warnings, 0 hints (46 files). DevPedia 0 errors, 0 warnings, 1 hint (50 files).
- `npm test`: 77 passed (8 files), 0 failed. No legacy exception anymore.
- `npm run build`: OK, 4 pages + `sitemap.xml`. `dist/` has no `blog/`, `en/blog/`, `rss.xml` or `pagefind/`; no `/blog` or `rss` string in the output.
- `npm run build:devpedia`: OK, 152 pages; Pagefind 150 pages, 2 languages.
- `npm run check:links`: OK across 4 pages. `npm run check:links:devpedia`: OK across 152 pages. `npm run check:en-language`: OK.
- Portfolio preview: `/`, `/en/`, `/about-me/`, `/en/about-me/`, `/sitemap.xml` 200; `/blog/`, `/en/blog/`, `/blog/testing/`, `/rss.xml`, `/en/rss.xml` 404. Built HTML diffed against a pre-M7 build: only the intended changes.
- Visual (preview): landing ES desktop (CTAs, footer), About me EN desktop (nav pill, promo card), About me ES 375px light (mobile menu with DevPedia row, promo card), no horizontal overflow.
- DevPedia (preview): Search ES (results, context, close), guide page (TOC, previous/next, Copy link → "Enlace copiado", link to the EN edition, light/dark).

## M8 — Validation and documentation

Acceptance review of spec v1.0 §38 (21 criteria): all satisfied, with later decisions from this file prevailing where they differ (for example the analytics contract replaces the spec's `related_guide_click` with `share`, since there is no related-guides UI). Intentionally out of scope: related guides, prerequisites, level and learning paths (the model does not prevent them); lint and formatting checks (the repository has none, and none were added).

Changes:

- `src/components/ThemeToggle.astro`: `lang` typed as `'es' | 'en'` instead of importing the portfolio's `Lang` from `src/content`, so the shared primitive no longer references portfolio copy (type-only; no output change). Same shape `Flag` already used.
- `.gitignore`: `.playwright-mcp/` (browser automation logs appeared during validation).
- Documentation rewritten for the two-app repository: `README.md`, `CLAUDE.md`, `AGENTS.md` (mirrors `CLAUDE.md`).
- `docs/BLOG_TRANSLATION_PROGRESS.md` → `docs/I18N_PROGRESS.md`: DevPedia routing, pairing by `id`, content layout, decisions; removed the old blog routing, `urlSlug`, engagement counters and scripts that no longer exist. The open question about "tres piezas" in the prompting guide is resolved in the content (it now says five pieces in both editions).
- `docs/EDITORIAL_GUIDELINES.md`: DevPedia paths, guide as the editorial unit, new "Modelo de contenido y frontmatter" (fields, `id` / `slug` / `order` responsibilities, ES/EN pairing), slug rules based on the `slug` field, sections as anchors, and slug stability after launch (no redirects, so a rename is an explicit decision and never changes the `id`).
- `docs/EN_EDITORIAL_GUIDE.md`: DevPedia paths and terminology, English slugs written for the English title, shared `id`.
- Scripts already had neutral names (`check-links.mjs`, `check-en-language.mjs`); no rename needed.

Validation:

- Architecture: DevPedia imports from outside `devpedia/` only `Icon`, `Flag`, `ThemeToggle`, `theme.css`, `surfaces.css`. No portfolio `Layout`, `Nav`, `Footer`, copy, config or GA id; the portfolio imports nothing from `devpedia/` and knows its origin only through `DEVPEDIA_URL`.
- Domain independence: rebuilt with `SITE_URL=https://handbook.example.org`: every canonical, hreflang, `og:url`, JSON-LD URL, sitemap entry, robots line and the analytics host use the new origin; `devpedia.camilasabino.dev` appears 0 times in the output. Remaining `camilasabino.dev` strings are authorship (`AUTHOR_URL`, GitHub profile), by design. The domain lives only in the `astro.config.mjs` default, `devpedia/.env.example`, the wrangler route and the portfolio's `DEVPEDIA_URL`.
- Routing and SEO sweep over the 152 built pages: all 16 hub routes of the brief exist; exactly one `<h1>`; `<html lang>` matches the edition; canonical = `SITE_URL` + path; `og:url` = canonical; hreflang es/en/x-default present, self-referencing and reciprocal; the language switcher links to the alternate; title format `… | DevPedia` / home `DevPedia — A handbook for Software Engineering`; description, favicon, OG/Twitter tags present and `og:image` files exist; JSON-LD 2 `WebSite`, 136 `TechArticle`, 150 `BreadcrumbList` (root DevPedia, last item = canonical, every item a built page); guides have `og:type` article; previous/next: 126 with each side (10 sequences), never across languages or parents; sitemap = exactly the 152 built pages; robots `Allow: /` + sitemap. No `/blog` route or link.
- Content: 68/68 guides with identical per-folder counts; ids unique; content-model tests and build-time validation pass.
- Search (preview): ES query returns only ES results with context (`Diseño › Patrones › …`) and excerpts; EN only `/en/`; guides, topics and subtopics indexed; no-results state; focus to input on open, ArrowDown to results, Escape closes and returns focus to the trigger; full-screen on 375px. Index: 150 pages, 8819 words (unchanged from M6, no duplicated content).
- Analytics: default build has no GA script; no request to Google and `window.gtag` undefined while using search, next and the language switcher. Build with a test id: `guide_view`, `topic_view` (topic and subtopic), `search` (`lang`, `result_count`, no query), `search_result_click`, `next_guide_click`, `share`, `language_change`, each once, with conceptual ids; Previous not tracked.
- Accessibility / responsive (360px sweep of 10 pages, plus screenshots): one `<h1>`, no heading level skips, no unnamed links or buttons, no images without `alt`, skip link, tables in a focusable scroll wrapper, `<pre>` focusable, Mermaid rendered with Enlarge, no horizontal overflow. Screenshots: desktop home ES, Design patterns ES, Claude Code EN (light), guide EN with TOC and Mermaid; mobile AI Engineering, Architecture (light), guide with Mermaid and tables, Search.
- Portfolio (preview): `/`, `/en/`, `/about-me/`, `/en/about-me/`, `/sitemap.xml` 200; `/blog/`, `/en/blog/`, `/blog/testing/`, `/rss.xml` 404. One `<h1>`, no overflow, no `/blog` links. DevPedia in landing CTA, nav pill, mobile menu, footer (`Inicio · Sobre mí · DevPedia`) and About me promo card, dark and light.
- Tracked artifacts: none of `dist/`, `.astro/`, `node_modules/`, `.playwright-mcp/` is tracked.

## M8 — Intentional legacy references

- `devpedia/src/lib/content-model.ts`: comment contrasting the model with "the old blog".
- `test/devpedia/content-model.test.ts`: "never links to the old blog" guard.
- `test/devpedia/seo.test.ts`: asserts JSON-LD is not `BlogPosting`.
- Guides: the external `https://claude.com/blog/…` link; "Para un blog técnico" / "For a technical blog" as prose; "este artículo" / "this article" as natural prose in a few guides (allowed by the spec).
- `article` as HTML element, `og:type`, `article:*` meta and `TechArticle`.
- Docs: `/blog` mentioned only to say it is gone and reserved (`README.md`, `CLAUDE.md`, `AGENTS.md`, editorial guide), and this file's history.

## M8 — Follow-ups

- `astro build --root devpedia` warns that `markdown.remarkPlugins` / `rehypePlugins` / `remarkRehype` are deprecated in Astro 7. Resolved in M9.
- `wrangler.jsonc` and `wrangler.devpedia.jsonc` point `$schema` at `node_modules/wrangler/config-schema.json`, which no longer exists since wrangler left the dependencies in M7. Resolved in M9 (Wrangler is a devDependency in each repository).
- Cloudflare setup for DevPedia (Workers Builds project, custom domain, `GA_MEASUREMENT_ID` build variable) has to be created in the dashboard before the first deploy.
- The `ENGAGEMENT` KV namespace from the old Worker still exists in Cloudflare; delete it manually if its data is no longer wanted.
- Carried over: Mermaid has no reserved height, so a plain hash link (not through the TOC) can land short of its heading; hubs rank below guides for their own name in search; the `search` event is lost when leaving within 1 s of typing; no custom 404 page; the composite `design` cover is a first version; `guide.cover` assumes 1200×630.

## Verification baseline (M8)

- `npm run check`: exit 0. Portfolio 0 errors, 0 warnings, 0 hints (46 files). DevPedia 0 errors, 0 warnings, 1 hint (`document.execCommand` fallback in `clipboard.ts`).
- `npm test`: 77 passed (8 files), 0 failed.
- `npm run build`: OK, 4 pages + `sitemap.xml`. `npm run build:devpedia`: OK, 152 pages; Pagefind 150 pages, 8819 words, 2 languages.
- `npm run check:links`: OK across 4 pages. `npm run check:links:devpedia`: OK across 152 pages. `npm run check:en-language`: OK.

## M9 — Repository separation

- Standalone repository at `../devpedia` (sibling of `camilasabino.dev`), branch `main`, no remote. Standard layout at the root: `src/`, `public/`, `test/`, `scripts/`, `docs/`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `wrangler.jsonc`, `.env.example`, `.gitignore`, `package.json`, `package-lock.json`, `README.md`, `CLAUDE.md`, `AGENTS.md`.
- History: `git subtree split --prefix=devpedia` in `camilasabino.dev`, cloned into this repository and renamed to `main`. The 7 commits that touched `devpedia/` (M1–M7) are preserved with their original authors and dates; commits that only touched the portfolio are absent. Files that lived outside `devpedia/` (tests, scripts, docs, wrangler, primitives, tokens) enter through the M9 changes only. The temporary `devpedia-history` branch was deleted; no submodule, subtree link, shared package or symlink remains.
- Internalized primitives: `src/components/{Icon,Flag,ThemeToggle}.astro` (copies; `ThemeToggle` now types `lang` with DevPedia's own `Lang`). Every import (components, MDX components, 6 guides) points inside `src/`.
- Internalized styles: `src/styles/{theme,surfaces}.css`, imported by `global.css` with relative paths. The `@source` entries for the portfolio primitives are gone (they are inside the scanned root now); `@source not "../../docs"` keeps documentation prose out of Tailwind's class scan so the CSS stays identical.
- Shiki: `src/lib/shiki-theme.ts` already lived in DevPedia since M7; `astro.config.mjs` imports only internal paths.
- Markdown: the deprecated `markdown.rehypePlugins` became `markdown.processor: unified({ rehypePlugins })` from `@astrojs/markdown-remark` (what Astro 7 did internally when coercing the legacy option). The deprecation warning is gone; the built HTML is unchanged.
- Package: `devpedia` (private). Scripts `dev`, `build` (`astro build && pagefind --site dist`), `preview`, `check`, `astro`, `test`, `check:links`, `check:en-language`. Dependencies derived from real imports and tooling with the versions carried over from the former lockfile (no version changed); `wrangler` added as a devDependency (see below). `allowScripts` adds `workerd` (Wrangler's runtime postinstall).
- Wrangler: `wrangler@^4.143.0` (current 4.x at the time of the split) as a devDependency, because Workers Builds deploys with `npx wrangler deploy`; pinning it through the lockfile makes deploys reproducible, and `wrangler.jsonc`'s `$schema` (`node_modules/wrangler/config-schema.json`) resolves again.
- Tests moved from `camilasabino.dev/test/devpedia/` to `test/`, reading only files inside this repository. Scripts: `scripts/check-links.mjs` (defaults to `dist/`), `scripts/check-en-language.mjs` (English guide sources + `dist/en`; the portfolio-only allowlist entry was dropped). Two stale `npm run build:devpedia` mentions in `Search.astro` (a comment and a `console.warn`) now say `npm run build`.
- Environment: `.env.example` documents only `SITE_URL` and `GA_MEASUREMENT_ID`.
- Docs moved here: `docs/specs/devpedia-spec.md` (now versioned; identical to the former local copy, since it had no repository paths to adjust), `docs/implementation-status.md` (this file), `docs/EDITORIAL_GUIDELINES.md`, `docs/EN_EDITORIAL_GUIDE.md`, `docs/I18N_PROGRESS.md` (paths and commands updated). New `README.md`, `CLAUDE.md`, `AGENTS.md`.
- Portfolio side (`camilasabino.dev`): `devpedia/`, `test/devpedia/`, `wrangler.devpedia.jsonc`, this file, the DevPedia docs and the multi-app scripts, dependencies and workarounds were removed; it keeps linking to DevPedia through `DEVPEDIA_URL`.

## M9 — Verification

- Clean install: `rm -rf node_modules && npm ci`: OK (571 packages).
- `npm run check`: 0 errors, 0 warnings, 1 hint (`document.execCommand` fallback in `clipboard.ts`).
- `npm test`: 77 passed (8 files).
- `npm run build`: 152 pages; Pagefind 150 pages, 8819 words, 2 languages. No Astro deprecation warning.
- `npm run check:links`: OK across 152 pages. `npm run check:en-language`: OK.
- Output against a build of the pre-split `devpedia/`: HTML, CSS, sitemap, robots and Pagefind index identical (only the key order of `pagefind-entry.json`, as in earlier milestones); the only JS change is the Search `console.warn` text, which now says `npm run build`.
- Smoke review: `npm run dev` home, topic (Arquitectura), subtopic (Patrones), guide (SOLID: TOC, Mermaid, heading anchors, previous/next, Share, dark/light toggle, canonical/hreflang, no horizontal overflow); Search on `npm run preview` (EN query returns EN results with context).
- Independence audit: no reference to `../camilasabino.dev`, `../src`, `--root devpedia`, `devpedia/dist`, `wrangler.devpedia`, the `*:devpedia` scripts or `test/devpedia` outside this file's history; no absolute local path. `https://camilasabino.dev` appears only as authorship.

## M9 — Follow-ups

- Create the GitHub repository and connect it as `origin`; set up the Cloudflare Workers Builds project (build `npm run build`, deploy `npx wrangler deploy`), the `devpedia.camilasabino.dev` custom domain and the `GA_MEASUREMENT_ID` build variable.
- `npm audit`: 3 moderate advisories in `undici`, pulled in by `wrangler` → `miniflare` (local dev tooling, not shipped). Only fixable with `npm audit fix --force`; revisit on the next Wrangler update.
- The `ENGAGEMENT` KV namespace from the old portfolio Worker still exists in Cloudflare; delete it manually if its data is no longer wanted.
- Carried over from M8: Mermaid has no reserved height, so a plain hash link (not through the TOC) can land short of its heading; hubs rank below guides for their own name in search; the `search` event is lost when leaving within 1 s of typing; no custom 404 page; the composite `design` cover is a first version; `guide.cover` assumes 1200×630.

## Working tree

- M1–M8 are committed in `camilasabino.dev`; M1–M7 are part of this repository's history through the subtree split.
- M9 is uncommitted in both repositories, pending user validation.
- No push. No deploy. No remote.

## Next

Create GitHub remote and deploy DevPedia, then deploy the portfolio.
