# DevPedia i18n record

How DevPedia's Spanish and English editions are wired, and the editorial decisions
taken while translating. It should be enough to pick the work up in a fresh session.

- **English editorial rules:** `docs/EN_EDITORIAL_GUIDE.md` (voice, glossary, code
  and Mermaid rules, definition of done).
- **Spanish rules, authoritative for the original:** `docs/EDITORIAL_GUIDELINES.md`.

## Status

All 68 guides exist in both editions and have been through both passes (fidelity
and naturalness), across Architecture (11), Design principles (4), Design
patterns (28), Testing (13) and Claude Code (12). The 4 topics and 3 subtopics are
translated too.

A new guide counts as done only when both editions exist and the English one has
had both passes (see the definition of done in `EN_EDITORIAL_GUIDE.md`).

## How the two editions are wired

### Routing

| Page | Spanish | English |
| --- | --- | --- |
| Home | `/` | `/en/` |
| Topic | `/<topic-slug>/` | `/en/<topic-slug>/` |
| Subtopic | `/<topic-slug>/<subtopic-slug>/` | `/en/<topic-slug>/<subtopic-slug>/` |
| Guide | `/<topic-slug>/[<subtopic-slug>/]<guide-slug>/` | `/en/<topic-slug>/[<subtopic-slug>/]<guide-slug>/` |

Slugs are localized and written for each language (`/arquitectura/drivers-de-arquitectura/`
↔ `/en/architecture/architectural-drivers/`). English URLs are never derived from
the Spanish by string replacement. Keep published slugs stable: there are no
redirects.

### Identity across editions

Every topic, subtopic and guide has a frontmatter `id`: English, kebab-case, the
same in both languages, unique within its content type. The two editions of a node
are the two files that declare the same `id`; the file path and the slug play no
part in the pairing.

Everything derived from the pairing (the language switcher target, `hreflang`,
the sitemap's `xhtml:link` alternates, analytics ids) goes through `ContentIndex`
in `src/lib/content-model.ts`. The build fails if a node exists in only
one edition, or if the two editions disagree on structure (parent topic or
subtopic, `order`, `section`, `icon`, section ids).

### Content layout

```text
src/content/
  topics/{es,en}/<id>.yaml
  subtopics/{es,en}/<id>.yaml
  guides/{es,en}/<topic>/[<subtopic>/]<id>.mdx
```

### UI copy

Interface strings live in `src/i18n/index.ts`, one object per language
with the same shape. Page components receive `lang`; MDX components read it from
the URL through `langFromPath`. Client scripts receive their strings through
`data-` attributes, so the script bundle stays language-neutral. The product
descriptor, "A handbook for Software Engineering", stays in English in both
editions (`lang="en"`).

### Search

Pagefind indexes each page under its `<html lang>` and searches only the index of
the current edition, so Spanish pages return Spanish results and English pages
English ones.

## Decisions on record

- **Reading time** uses the same rates in both languages. Matching word counts
  between editions is not a goal.
- **`created` / `lastUpdated`** may differ between editions: the English edition
  was published later.
- **Hand-authored UML figures** (`src/components/mdx/uml/`) are shared.
  Their labels are English domain identifiers in both editions; only the caption,
  which is the figure's accessible name, is per language.
- **SOLID headings.** In Spanish each principle's heading is followed by a
  `<small>` gloss translating its English name. In English the gloss would repeat
  the heading, so it is omitted. The anchors (`#s--single-responsibility-principle`,
  etc.) are identical in both editions, which the cross-links depend on.

### Attributed quotes

Both quotations in "What is software architecture?" were checked against their
sources, and the English edition uses the original wording:

- Bass, Clements and Kazman, *Software Architecture in Practice*: "The software
  architecture of a system is the set of structures needed to reason about the
  system, which comprise software elements, relations among them, and properties
  of both."
- Ralph Johnson, as quoted by Martin Fowler: "Architecture is the things that
  people perceive as hard to change."

The SOLID statements use Robert C. Martin's canonical English formulations for
SRP, OCP, ISP and DIP. The Liskov statement is the author's own paraphrase, not a
quotation from Liskov and Wing, so it is rendered as English prose.

## Open editorial questions

Anything in the Spanish original that looks like an error is logged here rather
than silently fixed in the English edition. None is open.

## Verification

```bash
npm test                        # content model: 68/68 pairing, structure, links within the same edition
npm run build                   # validates the model again and builds the Pagefind index
npm run check:links             # internal links and heading anchors, after the build
npm run check:en-language       # leftover Spanish in the English edition, after the build
```

Automatic checks cover coverage and integrity. They say nothing about editorial
quality.
