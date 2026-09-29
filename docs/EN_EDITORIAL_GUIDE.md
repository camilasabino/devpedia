# English edition — editorial guide

DevPedia's English edition, under `/en/`, is an idiomatic adaptation of the
Spanish original, not a literal translation. This guide is the companion to
`EDITORIAL_GUIDELINES.md`, which stays the authority for the Spanish edition and
for anything about structure, guide shape, the content model and frontmatter, or
technical accuracy. Read this one before writing or reviewing anything under
`src/content/**/en/`. `I18N_PROGRESS.md` records how the two editions are
paired and the translation decisions taken so far.

## The target reader

A working software engineer in the US who already knows how to program. They do
not need programming explained to them, but they may not know the specific concept
the guide is about. Every explanation that exists in the Spanish original exists
in the English one: the reader's fluency in English is assumed, their familiarity
with the topic is not.

## Voice

The Spanish original is direct, didactic, and technically rigorous, written by an
engineer who has made these decisions in production. The English has to read the
same way, as if it had been drafted in English from the start.

- **US English**, in spelling and in punctuation (serial comma, `behavior`,
  `organization`, quotes inside quotation marks where US style puts them).
- **Second person and contractions.** `you`, `you'll`, `it's`, `don't`. The Spanish
  `voseo` is a register, not a feature to reproduce; it becomes plain, close,
  unfussy English. Never substitute US slang for it.
- **Sober, not sold.** No marketing register, no grandiosity, no "in today's
  fast-paced world", no "unlock", "leverage", "seamless", "powerful", "robust
  solution". No throat-clearing openers and no summarizing closers that the
  original does not have.
- **No academic inflation.** The Spanish is precise without being formal. "Vale la
  pena desarmarla" is `Let's unpack that`, not "It is worthwhile to deconstruct
  this definition".
- **Sentence case** for every title and heading, keeping proper nouns, acronyms,
  and the established names of patterns and principles: `What is software
  architecture?`, `Factory Method`, `SOLID`, `Test-Driven Development`.

## What must not change

- The set of guides, the frontmatter that must match across editions (`id`,
  `topic`, `subtopic`, `section`, `order`), and the order of sections inside each
  guide.
- The heading hierarchy, and the sequence of ideas within a section.
- Examples, tables, lists, callouts, notes, and references.
- Numbers, magnitudes, units, conditions, formulas, and results.
- Conceptual distinctions, stated assumptions, and trade-offs.
- The strength of each claim. `puede` / `suele` / `conviene` / `debe` map to
  `can` / `usually` / `it's worth` / `must`, and they are not interchangeable. A
  contextual heuristic in Spanish stays a contextual heuristic in English; it never
  becomes a universal rule.
- Nuance, conditions, exceptions, and deliberate repetition that carries a
  teaching function.
- The author's identity, the example domain (AndesShop, Payments), and its
  cultural context. Nothing gets Americanized to fit the new audience.

## What you may change

Sentence boundaries, clause order, and syntax — whatever English needs to flow.
Spanish chains long subordinate clauses that read as run-ons in English; split
them. Spanish fronts circumstantial phrases that read better trailing in English;
move them. The argument's progression and the section order stay put.

## Idiom, by intent

Adapt Spanish expressions by what they do in the paragraph, not by their words.

| Spanish | English | Why |
| --- | --- | --- |
| Vale la pena desarmarla | Let's unpack that | Signals the breakdown that follows |
| Qué conviene usar | Which option makes sense | It is a judgment, not an obligation |
| No alcanza con… | …isn't enough | The Spanish is a negation of sufficiency |
| La invariante que el patrón busca proteger | The invariant the pattern protects | Name the property, drop the periphrasis |
| A grandes rasgos | Broadly | Not "in broad strokes" |
| Tener en cuenta que… | Keep in mind that… / Note that… | Depends on weight in context |
| Sirve para… | It's for… / Use it to… | Not "It serves to…" |
| Un caso de uso típico | A typical use case | Same term, no inflation |

## Anti-calque checklist

Read the English on its own, without the Spanish. These are the recurring tells:

- `the same` used as a pronoun (`el mismo`) — name the noun.
- `permits`/`allows to` for `permite` — use `lets you` or `can`.
- `realize` for `realizar` — it is `perform`, `run`, or just `do`.
- `actually` for `actualmente` — it means `currently`.
- `eventually` for `eventualmente` — it means `possibly` or `if it happens`.
- `control` for `controlar` in the sense of `check`/`verify`.
- `dispose of` for `disponer de` — it means `have available`.
- `in the case of X` where English would just say `for X`.
- `we can observe that` / `it is important to highlight` — the Spanish rarely says
  this either; when it does, say it plainly.
- Noun-heavy chains where English uses a verb: `the realization of the validation`
  → `validating`.

## Glossary

Shared across every guide. Consistency within a term, without forcing one
translation onto a word that means different things in different places.

### Terms that must stay distinct

| Distinction | Use |
| --- | --- |
| `confiabilidad` vs `disponibilidad` | **reliability** vs **availability** — never conflate |
| `autenticación` vs `autorización` | **authentication** vs **authorization** |
| `unit testing` vs `un test unitario` | **unit testing** (the practice) vs **a unit test** (the artifact) |
| `prueba` vs `test` | **test**; **testing** for the activity |
| `latencia` vs `tiempo de respuesta` | **latency** vs **response time** |
| `consistencia` vs `coherencia` | **consistency** vs **coherence** |
| `rendimiento` vs `throughput` | **performance** vs **throughput** |
| `error` vs `fallo` vs `falla` | **error** vs **failure** vs **fault**, per the source's meaning |
| `requisito` vs `restricción` | **requirement** vs **constraint** |

### Standing translations

| Spanish | English |
| --- | --- |
| drivers de arquitectura | architectural drivers |
| atributos de calidad | quality attributes |
| decisiones de arquitectura | architecture decisions |
| registro de decisiones de arquitectura (ADR) | architecture decision record (ADR) |
| acoplamiento / cohesión | coupling / cohesion |
| contexto delimitado | bounded context |
| lenguaje ubicuo | ubiquitous language |
| eventos de dominio | domain events |
| monolito modular | modular monolith |
| capa anticorrupción | anti-corruption layer |
| sistemas distribuidos | distributed systems |
| fallo parcial | partial failure |
| reintentos | retries |
| presupuesto de error | error budget |
| dobles de test | test doubles |
| pruebas de aceptación de usuario | user acceptance testing (UAT) |
| cobertura | coverage |
| deuda técnica | technical debt |
| contrapartidas | trade-offs |
| puesta en producción / despliegue | deployment |
| puntos de extensión | extension points |
| manejador | handler |
| envoltorio | wrapper |
| subyacente | underlying |

### Kept as-is

Pattern names (`Factory Method`, `Circuit Breaker`, `Bulkhead`), principle names
(`SOLID`, `KISS`, `DRY`, `YAGNI`), approach names (`Domain-Driven Design`,
`Test-Driven Development`, `Spec-Driven Development`, `Hexagonal Architecture`,
`Onion Architecture`, `Clean Architecture`, `Event Sourcing`), protocols, APIs,
commands, identifiers (`POST /payments`, `/init`, `deny`, `CLAUDE.md`), and every
term that is already English in the Spanish source (`timeout`, `endpoint`, `mock`,
`stub`, `spy`, `throughput`, `SLO`, `SLI`, `SLA`, `trade-off`, `blast radius`,
`feature flag`, `codebase`, `schema`).

## Code and diagrams

**Code.** Behavior stays identical. Identifiers, APIs, commands, example paths,
and contracts that are already English stay byte-for-byte. Spanish comments and
explanatory strings become English. Contract values, fixtures, and functional
strings are only translated when they are prose meant for a human reader and
translating them cannot change what the example demonstrates. Never refactor or
"improve" an example while translating it.

**Mermaid.** Translate everything a reader sees: node labels, edge labels,
messages, titles, notes, legends, and visible group names. Keep node ids, edge
directions, cardinalities, message order, grouping, `class`/`style` directives, and
any configuration exactly as they are. Do not translate class names, method names,
events, or entity names that are identifiers shared with the code. Check that the
longer English labels are not clipped or overlapping; if they are, adjust line
breaks or spacing only — never the content or the relations.

**Hand-authored UML** (`src/components/mdx/uml/`) is shared by both languages and
already uses English domain identifiers; only its caption is per-language.

## Links

Internal links must point at the English URL of the same page (`/en/…`),
including the heading fragment, which changes because the heading text changes.
External links and references are untouched; links to other sites use their
English version when one exists. The English `slug` is written in English for the
English title, never derived from the Spanish one, and like every published slug
it stays stable once released. The `id` is shared with the Spanish edition and
never translated.

## Attributed quotes

Use the original English wording only when it can be verified in the source. Do
not present a back-translation as a verified English quotation. When the original
wording cannot be verified, keep the attribution and mark the quote discreetly as
a translation, or log it in `I18N_PROGRESS.md` for review.

## Definition of done

A guide is done when both passes have been run and recorded:

1. **Fidelity** — section by section against the Spanish: nothing dropped, nothing
   added, no claim strengthened or weakened.
2. **Naturalness** — the English read on its own, with the Spanish closed, fixing
   forced syntax, calques, and rhythm.

Translated-but-unreviewed is not done.
