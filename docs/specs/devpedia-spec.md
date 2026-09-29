# DevPedia — Product Restructure & Migration Spec

**Status:** Approved for implementation  
**Version:** 1.0  
**Product:** DevPedia  
**Descriptor:** *A handbook for Software Engineering*  
**Primary language of this document:** English

---

## 1. Purpose

This document is the single source of truth for transforming the current `camilasabino.dev/blog` experience into **DevPedia**, an independent educational product focused on Software Engineering.

This is **not** a cosmetic rename of the current blog. The goal is to redefine the product's identity, information architecture, terminology, navigation, routing, content model, metadata, SEO semantics, and relationship with `camilasabino.dev`.

The implementation should preserve the strongest parts of the current experience—content quality, technical tone, readability, visual language, diagrams, examples, bilingual support—while removing the conceptual model of a chronological blog.

---

## 2. Product identity

### 2.1 Name

**DevPedia**

DevPedia should be treated as a standalone product and brand, not as a section of Camila Sabino's personal website.

### 2.2 Descriptor

Primary descriptor:

> **A handbook for Software Engineering**

Use this descriptor whenever the product needs immediate context, especially in:

- homepage hero;
- metadata;
- portfolio presentation;
- social previews;
- README/project documentation;
- initial branding surfaces.

The descriptor does not need to be part of the logo/wordmark itself.

### 2.3 Product definition

DevPedia is:

> A structured, evolving handbook for Software Engineering, designed both for learning concepts in depth and revisiting them later as practical reference.

It should help Software Engineers understand:

- concepts;
- principles;
- practices;
- architectural decisions;
- trade-offs;
- relationships between topics;
- practical applications.

### 2.4 Scope

The initial content already covers areas such as:

- Software Architecture;
- Design Principles;
- Design Patterns;
- Testing;
- AI Engineering;
- Claude Code as a subtopic of AI Engineering.

The taxonomy must be able to expand naturally in the future to areas such as:

- APIs;
- Distributed Systems;
- Security;
- Data;
- Observability;
- Developer Experience;
- Engineering Practices;
- Engineering Management;
- Technical Leadership.

The brand must therefore represent **Software Engineering as a discipline**, not only coding or software development implementation.

---

## 3. Product principles

### 3.1 Structured over chronological

Content organization must be driven by knowledge structure and learning relationships, not by publication date.

Publication chronology must not be a primary navigation mechanism.

### 3.2 Understanding over memorization

Guides should explain more than definitions. When applicable, content should cover:

- what a concept is;
- why it exists;
- what problem it addresses;
- how it works;
- when it is useful;
- when it is not useful;
- trade-offs;
- examples;
- relationships with adjacent concepts.

### 3.3 Practical over purely academic

DevPedia should combine conceptual rigor with practical Software Engineering.

Use, when appropriate:

- code;
- diagrams;
- Mermaid;
- architectural examples;
- decision scenarios;
- real-world trade-offs;
- implementation examples.

### 3.4 Connected over isolated

Content should progressively form a connected knowledge system rather than a flat collection of independent pages.

The architecture should allow relationships such as:

- prerequisites;
- related guides;
- previous/next guides;
- parent topic;
- subtopic;
- learning path membership.

Not all of these relationships need a complete UI in the first implementation, but the content model should not prevent them.

### 3.5 Evolving over finished

DevPedia is a living handbook.

Content may be:

- expanded;
- reorganized;
- corrected;
- updated;
- connected to new topics.

The product does not claim exhaustive coverage of Software Engineering.

---

## 4. What DevPedia is not

DevPedia must not be presented as:

- a personal blog;
- a chronological feed of posts;
- a news publication;
- a collaborative wiki;
- product documentation;
- a course platform;
- a certification platform;
- a glossary-only product;
- a purely alphabetical encyclopedia.

It is best described as:

> **Educational knowledge product + Software Engineering handbook + reference system.**

---

## 5. Relationship with `camilasabino.dev`

`camilasabino.dev` remains Camila Sabino's personal and professional website.

DevPedia becomes an independent project that is showcased from the portfolio.

Conceptually:

```text
camilasabino.dev
├── Home
├── About me
├── Portfolio
│   ├── DevPedia
│   ├── Blendify
│   └── SerendiPeak
└── Blog                  # reserved for a future editorial/personal blog
```

Product positioning inside the portfolio:

```text
DevPedia
A handbook for Software Engineering

Blendify
Playlist builder & music discovery

SerendiPeak
Interactive mountain atlas
```

DevPedia should feel like a product **created by Camila Sabino**, not a subsection called "Blog" inside her website.

---

## 6. Future personal blog separation

The current technical content must no longer consume the conceptual role of `/blog`.

`camilasabino.dev/blog` should remain available for a future editorial/personal publication with a different purpose and content model.

That future blog could include:

- professional experiences;
- lessons learned from projects;
- personal views on Software Engineering;
- career reflections;
- AI Engineering experiences;
- mountaineering;
- running;
- mountain-guide training;
- other personal narratives.

That future product would legitimately use:

- publication dates;
- chronological feeds;
- posts;
- editorial storytelling;
- visible authorship;
- personal narrative.

DevPedia must remain structurally and semantically separate from it.

---

## 7. Hosting and domain strategy

### 7.1 Initial target

DevPedia should initially be exposed at:

```text
https://devpedia.camilasabino.dev
```

### 7.2 Future domain independence

The implementation must not assume DevPedia will always live under `camilasabino.dev`.

It should be possible to move it later to an independent domain without redesigning the application architecture.

Avoid unnecessary hard-coded dependencies on `camilasabino.dev` in:

- routing;
- metadata generation;
- canonical URLs;
- assets;
- content paths;
- navigation;
- analytics configuration;
- branding.

Prefer configuration for values such as:

```text
SITE_NAME
SITE_URL
SITE_DESCRIPTION
AUTHOR
```

---

## 8. Legacy URL policy

This migration uses a **hard cutover**.

Existing routes under:

```text
camilasabino.dev/blog/*
```

are intentionally **not preserved**.

Do not implement:

- HTTP 301 redirects;
- legacy route compatibility;
- old-to-new URL mapping;
- fallback routing for former blog URLs.

After migration:

- all internal links must point directly to DevPedia URLs;
- old `/blog/*` pages may return `404`;
- sitemap and canonical metadata must reference only the new DevPedia URLs;
- no code should remain solely to support the previous blog routing.

This is an explicit product decision. Do not add redirects as an unsolicited SEO optimization.

---

## 9. Information architecture

The old conceptual model:

```text
Blog
└── Topic
    └── Article
```

must become:

```text
DevPedia
├── Topics
│   ├── Architecture
│   ├── Design
│   ├── Testing
│   ├── AI Engineering
│   └── ...
│
├── Guides
│
├── Search
│
├── Learning Paths        # future
│
└── Reference             # future capability
```

The system must support hierarchy without forcing unnecessary depth.

Recommended conceptual hierarchy:

```text
Topic
└── Section or Subtopic
    └── Guide
```

A topic may also contain guides directly when a subtopic layer adds no value.

---

## 10. Content model

### 10.1 Topic

A `Topic` is a major Software Engineering knowledge area.

Initial examples:

```text
Architecture
Design
Testing
AI Engineering
```

Future examples may include:

```text
Distributed Systems
APIs
Security
Engineering Management
```

A topic should support:

- title;
- slug;
- description;
- ordering;
- visual metadata if currently used;
- sections/subtopics;
- guides.

### 10.2 Section / Subtopic

A section or subtopic groups related concepts when a topic becomes large enough to require internal structure.

Examples:

```text
AI Engineering
└── Claude Code
```

```text
Design
├── Design Principles
└── Design Patterns
```

The implementation must support this hierarchy without forcing every topic to use it.

### 10.3 Guide

`Guide` becomes the primary user-facing content unit.

Do not use `Post` as the main domain term.

Avoid using `Article` as the primary navigation/content-system label, although prose may still naturally say "article" where grammatically appropriate.

Examples of guides:

```text
What is Software Architecture?
Domain-Driven Design
SOLID Principles
Unit Testing
Prompting with Claude Code
```

### 10.4 Future reference content

Some future pages may be more referential than instructional, for example:

```text
HTTP Status Codes
REST Constraints
CAP Theorem
Design Pattern Catalog
Testing Terminology
```

A dedicated `Reference` content type is not required for the initial migration, but the architecture must not make it difficult to introduce later.

---

## 11. Initial taxonomy

The starting taxonomy should reflect the existing content rather than inventing empty categories.

Recommended initial structure:

```text
Software Engineering
│
├── Architecture
│
├── Design
│   ├── Design Principles
│   └── Design Patterns
│
├── Testing
│
└── AI Engineering
    └── Claude Code
```

Do not add future top-level topics until enough content exists to justify them.

### 11.1 AI Engineering

`Claude Code` must remain under `AI Engineering`.

Do not promote a specific vendor/tool to the same conceptual level as broader disciplines.

Current/future direction:

```text
AI Engineering
├── Foundations             # future
├── LLM Applications        # future
├── Agents                  # future
├── MCP                     # future
└── Claude Code
    ├── Introduction
    ├── Prompting
    └── Commands
```

---

## 12. Content ordering

Topics and guides must use explicit conceptual ordering.

Do not sort primarily by publication date.

Example:

```text
Architecture
01. Foundations
02. Architectural Drivers
03. System Architecture
04. Domain
05. Communication
06. Data
07. Resilience
08. Observability
09. Architecture Decisions
```

The order should communicate a meaningful progression while still allowing users to enter through any guide independently.

---

## 13. Content relationships

The content schema should be prepared to express relationships such as:

```yaml
prerequisites:
  - software-architecture-fundamentals

related:
  - architectural-drivers
  - domain-driven-design

next:
  - system-architecture

level: intermediate
```

Initial implementation may expose only part of this metadata, but avoid designing a content model that would require a future breaking migration to add it.

Preferred future relationship fields:

- `prerequisites`;
- `related`;
- `previous`;
- `next`;
- `level`;
- `learningPaths`.

---

## 14. Content metadata

Move away from blog-oriented frontmatter/domain semantics.

A guide should be able to express metadata similar to:

```yaml
title: Domain-Driven Design
description: ...
topic: architecture
section: domain
order: 3
level: intermediate
prerequisites:
  - software-architecture-fundamentals
related:
  - bounded-contexts
  - architectural-drivers
lastUpdated: 2026-09-28
```

Fields may be adapted to the existing codebase conventions instead of copied literally.

Optional/future metadata:

```yaml
readingTime:
tags:
authors:
reviewers:
status:
difficulty:
learningPaths:
```

Do not introduce fields with no current or near-term use merely for completeness.

---

## 15. Date semantics

Publication date must stop being a primary piece of UI.

Prefer:

```text
Last updated Sep 2026
```

instead of emphasizing:

```text
Published Sep 2026
```

An original publication date may remain internally or in structured metadata where useful, but the user-facing product should communicate that guides are maintained resources.

---

## 16. URL architecture

DevPedia URLs must have no blog semantics.

Do not use:

```text
/blog/
/posts/
/articles/
/YYYY/MM/
```

Preferred structure:

```text
https://devpedia.camilasabino.dev/<topic>/<guide>
```

Examples:

```text
/architecture/software-architecture
/architecture/domain-driven-design
/design/solid
/design/design-patterns
/testing/unit-testing
/ai-engineering/claude-code/prompting
```

Principles:

- lowercase;
- kebab-case;
- human-readable;
- no dates;
- no opaque IDs;
- avoid unnecessary path depth;
- hierarchy should be reflected when it improves comprehension.

The exact route shape may adapt to the current framework, but these semantics must be preserved.

---

## 17. Homepage

The DevPedia homepage must stop behaving like a blog landing page.

Its main role is to explain the product and help users enter the knowledge system.

### 17.1 Hero

Recommended content direction:

```text
DevPedia
A handbook for Software Engineering

Understand the concepts, decisions and trade-offs
behind better software.
```

Primary actions may include:

```text
Explore topics
Start learning
```

Do not add `Start learning` unless the current structure gives it a meaningful destination.

### 17.2 Primary homepage section

Use:

```text
Explore by topic
```

with the current top-level taxonomy.

### 17.3 Optional secondary sections

Only when content/design justify them:

```text
Start here
Featured guides
Recently updated
Explore all guides
```

`Recently updated` is acceptable because it communicates handbook maintenance.

Do not make `Latest posts` a primary concept.

### 17.4 Future homepage capabilities

The layout should be able to accommodate later:

- learning paths;
- knowledge maps;
- curated starting points;
- richer search/discovery;
- recently updated guides.

Do not implement these merely because they are listed here.

---

## 18. Topic pages

A topic page must behave as a knowledge hub, not a filtered blog archive.

Example:

```text
Architecture

Understand how systems are structured, why architectural
choices matter, and how those decisions affect evolution.

12 guides
```

Content should then be grouped structurally:

```text
Foundations
├── Software Architecture
├── Architectural Drivers
└── Architecture Characteristics

System Design
├── System Architecture
├── Communication Patterns
└── Data Architecture

Operations
├── Resilience
└── Observability
```

Do not display guides primarily as a newest-first feed.

---

## 19. Guide pages

Preserve the strong readability of the current long-form technical content while adapting the surrounding UX to DevPedia.

Recommended structure:

```text
Breadcrumb
Topic / Subtopic
Guide title
Description / lead
Guide metadata
Table of contents
Content
Related guides
Previous / Next
```

Possible metadata/components:

- topic;
- subtopic;
- level;
- last updated;
- table of contents;
- prerequisites;
- related guides;
- previous/next navigation.

Do not overload the first implementation with every future metadata capability.

### 19.1 Existing content compatibility

Continue supporting:

- Markdown/MDX content;
- code blocks;
- Mermaid diagrams;
- images;
- headings;
- links;
- existing technical formatting conventions.

---

## 20. Terminology migration

Remove blog-specific terminology from the product UI where it represents the domain model.

### Replace

```text
Blog        → DevPedia
Post        → Guide
Posts       → Guides
Temas       → Topics / localized equivalent
Latest posts → remove or redefine
Published   → Last updated, where appropriate
```

### Keep natural language flexible

Do not mechanically replace every occurrence of `article` inside prose.

For example:

```text
In this article, we'll explore...
```

may still be natural and does not need to become awkwardly rewritten solely for terminology consistency.

However, copy such as:

```text
In this blog...
Visit my blog...
Latest blog posts...
```

must be rewritten.

---

## 21. Navigation

Remove the product-level identity of `Blog`.

Initial DevPedia navigation should remain focused.

Recommended baseline:

```text
DevPedia
Topics
Search
```

Potential future item:

```text
Learn
```

only when learning paths or a meaningful learning-oriented destination exists.

Avoid adding navigation items solely to make the header look fuller.

### 21.1 Topic navigation

The existing topic browsing concept can be retained and improved, but should be reframed as exploration of a knowledge taxonomy rather than blog categories.

---

## 22. Search

Search is a core handbook capability.

Preserve existing search functionality if present, but align its language and result presentation with DevPedia.

Search should eventually be able to match:

- guide titles;
- descriptions;
- headings;
- topic names;
- subtopics;
- content text where supported.

Result context should be explicit, e.g.:

```text
Domain-Driven Design
Architecture › Domain

A guide to...
```

Do not implement semantic/vector search as part of this migration.

---

## 23. Branding and visual identity

DevPedia needs its own product identity while remaining visually compatible with the broader Camila Sabino ecosystem.

### 23.1 Preserve

Where they already work well, preserve:

- technical/terminal-inspired visual language;
- monospace accents;
- existing typography hierarchy;
- cyan/teal accent family currently associated with the site;
- code-oriented illustrations;
- Mermaid diagrams;
- strong desktop/mobile readability;
- current light/dark behavior if applicable.

### 23.2 Change

Reduce visual/copy signals that communicate:

```text
personal technical blog
```

Strengthen signals that communicate:

```text
knowledge system
engineering handbook
technical reference
educational product
```

### 23.3 Wordmark

A simple wordmark is sufficient for the initial migration:

```text
DevPedia
```

A new standalone symbol/logo is optional and should not block the migration.

### 23.4 Product authorship

Authorship can appear secondarily:

```text
DevPedia
A handbook for Software Engineering
by Camila Sabino
```

Do not brand the product primarily as:

```text
Camila Sabino's DevPedia
```

DevPedia is the product name.

---

## 24. Footer

DevPedia should have product-appropriate footer copy.

Direction:

```text
DevPedia
A handbook for Software Engineering.

Created by Camila Sabino.
```

Possible links:

- `camilasabino.dev`;
- GitHub, if relevant;
- language selector, depending on current layout.

Do not automatically duplicate the personal portfolio footer if it weakens DevPedia's independent identity.

---

## 25. Internationalization

DevPedia must continue supporting:

```text
ES
EN
```

Both language versions must share the same conceptual information architecture:

- topics;
- sections;
- guides;
- relationships;
- navigation components.

The English version must remain natural US English for a Software Engineering audience; it must not read like a literal Spanish translation.

The Spanish version should preserve natural Spanish usage and the established editorial voice.

Route localization should follow the existing application's established strategy unless there is a strong technical reason to change it.

Do not create unnecessary i18n migration complexity solely for this rebrand.

---

## 26. SEO and metadata

DevPedia must have independent site-level metadata.

### 26.1 Homepage

Recommended direction:

```text
Title:
DevPedia — A handbook for Software Engineering
```

```text
Description:
A structured handbook for learning Software Engineering concepts,
practices and trade-offs across architecture, design, testing,
AI Engineering and more.
```

Final wording may be refined during implementation to match metadata length constraints and language variants.

### 26.2 Guide titles

Recommended pattern:

```text
Domain-Driven Design | DevPedia
```

Avoid patterns such as:

```text
Domain-Driven Design | Camila Sabino Blog
```

### 26.3 Canonical URLs

Canonical metadata must reference the new DevPedia URL space only.

### 26.4 Sitemap

DevPedia must expose its own sitemap appropriate to the deployment architecture.

It must contain only current canonical URLs.

### 26.5 Robots

Ensure `robots.txt` correctly reflects the new site/deployment.

### 26.6 Structured data

Preserve or adapt existing structured data where correct.

Potential relevant schemas include:

- `WebSite`;
- `BreadcrumbList`;
- `TechArticle` / `Article` where semantically correct.

Do not add schema markup that misrepresents DevPedia solely for SEO.

---

## 27. Social/share metadata

Update Open Graph and equivalent social metadata so shared pages identify the product as DevPedia.

At minimum review:

- site name;
- page title;
- description;
- canonical URL;
- preview image;
- language/locale metadata where applicable.

Existing generic `/blog` social assets should be updated or replaced to use the DevPedia identity.

---

## 28. Existing content migration

The current content should be migrated, not rewritten from scratch.

For each existing content item:

1. assign the correct topic;
2. assign a section/subtopic when useful;
3. assign explicit ordering;
4. classify it as a guide;
5. update metadata to the new content model;
6. update internal links;
7. remove blog-specific product references;
8. preserve the technical substance unless a content issue is independently identified.

### 28.1 Content review checklist

Review existing content for references to:

- `blog`;
- `post` as a domain term;
- old topic/category routes;
- old home URLs;
- old breadcrumb labels;
- old navigation language;
- old internal links;
- old SEO metadata;
- old social metadata;
- chronological language that no longer fits.

Do not unnecessarily rewrite correct technical explanations simply to make the migration larger.

---

## 29. Internal links

All internal links must be migrated to the new DevPedia routes.

No internal link should intentionally point through the removed `/blog/*` route space.

Validate:

- inline content links;
- related-content links;
- topic links;
- breadcrumbs;
- nav/header links;
- footer links;
- homepage cards;
- language-switcher equivalents;
- sitemap entries.

---

## 30. Portfolio integration

`camilasabino.dev` must present DevPedia as a portfolio project, not as a site section.

Recommended product copy direction:

```text
DevPedia
A handbook for Software Engineering.

A structured educational product for exploring concepts,
practices and trade-offs across modern Software Engineering.
```

Potential project tags:

```text
Software Engineering
Knowledge Platform
Technical Writing
Product Design
```

Do not categorize it only as:

```text
Blog
Writing
Content
```

DevPedia is itself a product/design/engineering project.

---

## 31. Technical independence

Even if DevPedia remains in the same repository initially, its implementation should avoid needless coupling with the personal website.

Review coupling in:

- layout components;
- site configuration;
- metadata helpers;
- hard-coded paths;
- page titles;
- analytics;
- assets;
- content loaders;
- routing assumptions;
- environment variables.

Do not over-engineer a full repository split unless the current architecture makes it necessary.

The requirement is **future separability**, not immediate infrastructure duplication.

---

## 32. Analytics

If analytics are already configured, update them so DevPedia can be understood as a product rather than a blog section.

Useful event concepts include:

```text
guide_view
topic_view
search
search_result_click
related_guide_click
next_guide_click
language_change
```

Useful behavioral metrics may include:

- guides viewed per session;
- search usage;
- topic exploration;
- navigation depth;
- returning visitors;
- highly revisited/reference guides.

Do not add a large custom analytics implementation if the current analytics setup does not justify it. Preserve reasonable scope.

---

## 33. Accessibility

The migration must not regress accessibility.

Maintain or improve:

- semantic HTML;
- keyboard navigation;
- visible focus states;
- heading hierarchy;
- readable line length;
- sufficient contrast;
- accessible menus;
- accessible search;
- code-block usability;
- responsive tables/diagrams;
- screen-reader-friendly labels.

Any existing accessibility behavior should be preserved unless intentionally improved.

---

## 34. Responsive behavior

DevPedia must remain optimized for technical reading on both desktop and mobile.

Explicitly review:

- content width;
- typography;
- line height;
- table of contents;
- breadcrumbs;
- long titles;
- code overflow;
- tables;
- Mermaid diagrams;
- navigation;
- search;
- related-guide cards;
- previous/next navigation.

Do not let the redesign reduce the current reading quality in order to add more dashboard-like UI.

---

## 35. Implementation phases

The agent should implement the migration in controlled milestones.

### Milestone 0 — Audit

Before changing behavior:

- inspect the current `/blog` architecture;
- identify routes;
- identify content sources/schema;
- identify topic/category configuration;
- identify navigation components;
- identify SEO helpers;
- identify sitemap generation;
- identify i18n behavior;
- identify search implementation;
- identify current `/blog` references across the codebase;
- identify deployment assumptions related to `camilasabino.dev`.

Produce a concise implementation map before editing.

Do not change product decisions defined in this spec during the audit.

### Milestone 1 — Product identity

Implement the DevPedia identity:

- rename product-facing `Blog` references;
- introduce `DevPedia`;
- introduce the descriptor;
- update global copy;
- update site metadata;
- update header/footer identity;
- update social metadata/assets as required.

### Milestone 2 — Content model and taxonomy

Refactor the conceptual structure to:

```text
Topic → Section/Subtopic → Guide
```

Tasks:

- adapt content metadata;
- define explicit ordering;
- migrate existing categories/topics;
- ensure `Claude Code` is nested under `AI Engineering`;
- rename user-facing post/article domain terminology to guide where applicable;
- keep the model extensible for future topics.

### Milestone 3 — Homepage and topic UX

Restructure the current blog landing and topic pages into DevPedia discovery surfaces.

Implement:

- new homepage hero;
- topic exploration;
- knowledge-oriented topic pages;
- removal of chronological/latest-post positioning;
- appropriate empty/future states only where actually required.

### Milestone 4 — Guide UX and relationships

Update guide pages and navigation context:

- breadcrumbs;
- topic/subtopic context;
- last-updated semantics;
- table of contents if currently supported;
- previous/next navigation where meaningful;
- related guides if the data/model supports it cleanly.

Do not force unfinished relationship features into the UI.

### Milestone 5 — Routing and internal migration

Implement the DevPedia URL space.

Tasks:

- remove dependency on `/blog/*` routes;
- migrate internal links;
- update route helpers;
- update breadcrumbs;
- update sitemap generation;
- update canonicals;
- update language routing as needed;
- remove legacy blog route handling.

**Do not add redirects.**

### Milestone 6 — Product separation

Prepare and configure DevPedia for:

```text
https://devpedia.camilasabino.dev
```

Review:

- environment/configuration;
- deployment configuration;
- site URL generation;
- canonical host;
- sitemap host;
- analytics;
- cross-links back to `camilasabino.dev`.

Do not introduce an independent repository unless technically justified.

### Milestone 7 — Portfolio integration

Update `camilasabino.dev` so DevPedia is represented as a portfolio project.

Remove any navigation/copy that still treats the technical handbook as the site's blog.

Keep `/blog` available for future use; do not create the new personal blog as part of this project.

### Milestone 8 — Validation and cleanup

Run a final product and technical audit.

Check:

- no unintended `Blog` product terminology remains;
- no internal `/blog/*` links remain;
- DevPedia metadata is correct;
- topic hierarchy is correct;
- Claude Code hierarchy is correct;
- ES/EN work correctly;
- search works;
- sitemap contains correct URLs;
- canonical URLs are correct;
- mobile layout works;
- Mermaid/code blocks still work;
- accessibility has not regressed;
- no obsolete blog-only code remains unnecessarily.

Run the repository's relevant:

- tests;
- type checks;
- lint;
- formatting checks;
- build.

---

## 36. Out of scope

Do **not** implement the following as part of this migration unless they already exist and merely need adaptation:

- user accounts;
- authentication;
- progress tracking;
- quizzes;
- certifications;
- comments;
- community editing;
- ratings;
- semantic/vector search;
- AI chatbot;
- AI-generated answers;
- personalized recommendations;
- personalized learning paths;
- knowledge graph visualization;
- new personal blog;
- repository split solely for organizational purity;
- legacy URL redirects.

These are possible future product directions, not migration requirements.

---

## 37. Future opportunities

The architecture should leave reasonable room for future additions such as:

### Learning paths

```text
Software Architecture Foundations
Backend Engineering
Testing Fundamentals
AI Engineering Foundations
Engineering Management Foundations
```

### Richer content relationships

```text
prerequisite → guide → next concept
             ↘ related concept
```

### Knowledge graph

Example:

```text
DDD
↓
Bounded Context
↓
Microservices
↓
Event-Driven Architecture
```

### Reference pages

Concise pages for concepts that do not justify a full guide.

### Semantic search

Intent-oriented discovery instead of keyword-only search.

### AI-assisted exploration

A future assistant grounded exclusively in DevPedia content could help users navigate or understand existing material.

None of these should be implemented during this migration unless explicitly requested later.

---

## 38. Acceptance criteria

The migration is complete when all of the following are true:

1. The product is consistently identified as **DevPedia**.
2. The primary descriptor is **A handbook for Software Engineering**.
3. Main product UX no longer presents the content as a blog.
4. `Guide` is the primary user-facing content unit.
5. Content is organized structurally by topic/subtopic rather than publication chronology.
6. The initial taxonomy correctly represents Architecture, Design, Testing, and AI Engineering.
7. Claude Code is represented as a subtopic of AI Engineering.
8. DevPedia has its own homepage/product identity.
9. Topic pages behave as structured knowledge hubs, not chronological archives.
10. Guide pages preserve current technical content capabilities and reading quality.
11. Internal navigation no longer depends on `/blog/*`.
12. No legacy redirects or compatibility routes have been added.
13. Canonical URLs and sitemap use the new DevPedia URL space only.
14. ES and EN remain functional and structurally aligned.
15. Search remains functional and uses DevPedia terminology/context.
16. DevPedia can be deployed at `devpedia.camilasabino.dev` without relying on blog-specific assumptions.
17. The implementation does not unnecessarily prevent a later move to an independent domain.
18. `camilasabino.dev` presents DevPedia as a portfolio project.
19. `/blog` is no longer required by DevPedia and remains conceptually free for a future editorial blog.
20. Existing code blocks, diagrams, internal content rendering, responsive behavior, and accessibility remain functional.
21. Relevant tests, lint, type checks, formatting checks, and production build pass.

---

## 39. Product copy baseline

Use the following as the default product-positioning baseline unless a specific UI constraint requires a shorter variant.

### Name

```text
DevPedia
```

### Descriptor

```text
A handbook for Software Engineering
```

### Short description

```text
A structured, evolving handbook for Software Engineering.
```

### Extended description

```text
A structured handbook for exploring the concepts, practices and trade-offs behind modern Software Engineering, across architecture, design, testing, AI Engineering and more.
```

### Homepage positioning direction

```text
DevPedia
A handbook for Software Engineering

Understand the concepts, decisions and trade-offs behind better software.
```

These strings define the intended positioning, not an obligation to duplicate the exact same sentence across every surface.

---

## 40. Implementation constraints for the agent

- Treat this document as the authoritative product specification.
- Inspect the current implementation before editing.
- Adapt the implementation to the existing stack and conventions instead of rewriting working architecture without reason.
- Preserve existing content and behavior unless this spec explicitly changes its semantics.
- Prefer incremental, reviewable changes.
- Do not introduce unrelated refactors.
- Do not add speculative features from the Future Opportunities section.
- Do not add legacy redirects.
- Do not create or publish the future personal blog.
- Do not change the approved product name or descriptor.
- Do not flatten `Claude Code` back into a top-level topic.
- Do not make publication chronology a primary navigation model.
- Do not commit, push, or deploy unless explicitly requested.

If an implementation detail is ambiguous, choose the option that best preserves these three priorities:

1. **DevPedia is an independent product.**
2. **Its primary model is a structured Software Engineering handbook.**
3. **The migration should remain focused and avoid unnecessary complexity.**

---

## 41. Final decision summary

```text
Product name
DevPedia

Descriptor
A handbook for Software Engineering

Product type
Educational knowledge product / living handbook / reference system

Primary content unit
Guide

Primary organization
Topic → Section/Subtopic → Guide

Navigation principle
Knowledge structure, not chronology

Initial host
devpedia.camilasabino.dev

Future hosting
Must remain reasonably portable to an independent domain

Relationship with camilasabino.dev
Independent portfolio project created by Camila Sabino

Legacy /blog URLs
Removed intentionally; no redirects or backwards compatibility

Future /blog
Reserved for a separate personal/editorial blog
```
