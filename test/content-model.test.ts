import { describe, expect, it } from 'vitest';
import {
  ContentIndex,
  validateContentModel,
  type ContentModel,
  type Lang,
} from '@/lib/content-model';
import { bodies, cloneModel, frontmatter, loadModel, SOURCES } from './real-content';

describe('DevPedia content model', () => {
  const model = loadModel();
  const index = new ContentIndex(model);

  it('is valid', () => {
    expect(validateContentModel(model)).toEqual([]);
  });

  it('migrates every guide in both languages', () => {
    expect(model.es.guides).toHaveLength(68);
    expect(model.en.guides).toHaveLength(68);
  });

  it('never derives identity from the file name', () => {
    // Files are named after the id for convenience only; the frontmatter is the source.
    for (const lang of ['es', 'en'] as const) {
      for (const [path, source] of Object.entries(SOURCES[lang].guides)) {
        expect(frontmatter(source, path).id, `${path} must declare its id`).toBeTypeOf('string');
      }
    }
  });

  it('keeps the approved taxonomy and URLs', () => {
    const hubs = (lang: Lang) => [
      ...index.topics(lang).map((topic) => index.pathOf(lang, 'topic', topic.id)),
      ...index
        .topics(lang)
        .flatMap((topic) =>
          index.subtopicsOf(lang, topic.id).map((s) => index.pathOf(lang, 'subtopic', s.id)),
        ),
    ];
    expect(hubs('es')).toEqual([
      '/arquitectura/',
      '/diseno/',
      '/testing/',
      '/ai-engineering/',
      '/diseno/principios/',
      '/diseno/patrones/',
      '/ai-engineering/claude-code/',
    ]);
    expect(hubs('en')).toEqual([
      '/en/architecture/',
      '/en/design/',
      '/en/testing/',
      '/en/ai-engineering/',
      '/en/design/principles/',
      '/en/design/patterns/',
      '/en/ai-engineering/claude-code/',
    ]);
  });

  it('keeps Claude Code under AI Engineering', () => {
    for (const lang of ['es', 'en'] as const) {
      expect(index.subtopic(lang, 'claude-code')?.topic).toBe('ai-engineering');
      expect(index.topic(lang, 'claude-code')).toBeUndefined();
    }
  });

  it('assigns the agreed sections', () => {
    const sectionOrders = (lang: Lang, topicId: string, subtopicId?: string) => {
      const out: Record<string, number[]> = {};
      for (const guide of index.guidesOf(lang, topicId, subtopicId)) {
        (out[guide.section ?? '-'] ??= []).push(guide.order);
      }
      return out;
    };
    for (const lang of ['es', 'en'] as const) {
      expect(sectionOrders(lang, 'architecture')).toEqual({
        fundamentals: [1, 2],
        'domain-and-structure': [3, 4, 5],
        'communication-and-data': [6, 7],
        operations: [8, 9, 10],
        decisions: [11],
      });
      expect(sectionOrders(lang, 'testing')).toEqual({
        fundamentals: [1],
        'unit-testing': [2, 3, 4, 5, 6],
        'test-levels': [7, 8, 9],
        'non-functional': [10, 11, 12, 13],
      });
      expect(sectionOrders(lang, 'ai-engineering', 'claude-code')).toEqual({
        'getting-started': [1, 2, 3, 12],
        'context-and-control': [4, 5, 8],
        extension: [6, 7, 9],
        'teams-and-workflows': [10, 11],
      });
      expect(sectionOrders(lang, 'design', 'design-principles')).toEqual({ '-': [1, 2, 3, 4] });
      expect(Object.keys(sectionOrders(lang, 'design', 'design-patterns')).sort()).toEqual([
        '-',
        'behavioral',
        'creational',
        'reference',
        'structural',
      ]);
    }
  });

  it('uses the agreed guide slugs', () => {
    const paths = (id: string) => [
      index.pathOf('es', 'guide', id),
      index.pathOf('en', 'guide', id),
    ];
    expect(paths('architectural-drivers')).toEqual([
      '/arquitectura/drivers-de-arquitectura/',
      '/en/architecture/architectural-drivers/',
    ]);
    expect(paths('what-are-software-design-principles')).toEqual([
      '/diseno/principios/que-son-los-principios-de-diseno/',
      '/en/design/principles/what-are-software-design-principles/',
    ]);
    expect(paths('commonly-confused-patterns')).toEqual([
      '/diseno/patrones/patrones-que-suelen-confundirse/',
      '/en/design/patterns/commonly-confused-patterns/',
    ]);
    expect(paths('test-doubles')).toEqual([
      '/testing/dobles-de-test/',
      '/en/testing/test-doubles/',
    ]);
    expect(paths('usability-testing')).toEqual([
      '/testing/testing-de-usabilidad/',
      '/en/testing/usability-testing/',
    ]);
    expect(paths('claude-code-prompting')).toEqual([
      '/ai-engineering/claude-code/como-escribir-buenos-prompts/',
      '/en/ai-engineering/claude-code/how-to-write-good-prompts/',
    ]);
    expect(paths('claude-code-permissions')).toEqual([
      '/ai-engineering/claude-code/permisos/',
      '/en/ai-engineering/claude-code/permissions/',
    ]);
    expect(paths('claude-code-mcp')).toEqual([
      '/ai-engineering/claude-code/mcp/',
      '/en/ai-engineering/claude-code/mcp/',
    ]);
    expect(paths('claude-code-security')).toEqual([
      '/ai-engineering/claude-code/seguridad/',
      '/en/ai-engineering/claude-code/security/',
    ]);
    expect(paths('claude-code-plugins')).toEqual([
      '/ai-engineering/claude-code/plugins/',
      '/en/ai-engineering/claude-code/plugins/',
    ]);
    expect(paths('claude-code-teams-and-automation')).toEqual([
      '/ai-engineering/claude-code/equipos-y-automatizacion/',
      '/en/ai-engineering/claude-code/teams-and-automation/',
    ]);
    expect(paths('claude-code-getting-started-in-a-repository')).toEqual([
      '/ai-engineering/claude-code/como-empezar-en-un-repositorio/',
      '/en/ai-engineering/claude-code/getting-started-in-a-repository/',
    ]);
  });

  it('gives every route a unique URL', () => {
    const all = (['es', 'en'] as const).flatMap((lang) =>
      index.routes(lang).map((route) => route.path),
    );
    expect(new Set(all).size).toBe(all.length);
  });

  it('never links to the old blog', () => {
    for (const lang of ['es', 'en'] as const) {
      for (const { path, body } of bodies(lang)) {
        const links = [
          ...body.matchAll(
            /\]\((\/(?:en\/)?blog\/[^)]*)\)|href=["'](\/(?:en\/)?blog\/[^"']*)["']/g,
          ),
        ];
        expect(
          links.map((m) => m[1] ?? m[2]),
          path,
        ).toEqual([]);
      }
    }
  });

  it('links only to existing pages of the same edition', () => {
    for (const lang of ['es', 'en'] as const) {
      const known = new Set(['/', '/en/', ...index.routes(lang).map((route) => route.path)]);
      for (const { path, body } of bodies(lang)) {
        for (const match of body.matchAll(/\]\((\/[^)\s#]*)(?:#[^)\s]*)?\)/g)) {
          const target = match[1];
          expect(known.has(target), `${path} links to unknown page ${target}`).toBe(true);
          expect(target.startsWith('/en/'), `${path} links to the other edition: ${target}`).toBe(
            lang === 'en',
          );
        }
      }
    }
  });
});

describe('DevPedia content validation', () => {
  const errorsAfter = (mutate: (model: ContentModel) => void) => {
    const model = cloneModel();
    mutate(model);
    return validateContentModel(model);
  };
  const guide = (model: ContentModel, lang: Lang, id: string) =>
    model[lang].guides.find((g) => g.id === id)!;

  it('requires ids', () => {
    expect(errorsAfter((m) => (guide(m, 'es', 'solid').id = ''))).toContain(
      '[es] guide "": missing id',
    );
  });

  it('rejects ids that are not kebab-case', () => {
    expect(errorsAfter((m) => (m.en.topics[0].id = 'Software_Architecture')).join('\n')).toMatch(
      /is not kebab-case/,
    );
  });

  it('rejects duplicate ids', () => {
    const errors = errorsAfter((m) => (guide(m, 'es', 'solid').id = 'general-design-principles'));
    expect(errors).toContain('[es] duplicate guide id "general-design-principles"');
  });

  it('pairs editions by id', () => {
    const errors = errorsAfter((m) => (guide(m, 'en', 'solid').id = 'solid-principles'));
    expect(errors).toContain('guide "solid" has no English counterpart');
    expect(errors).toContain('guide "solid-principles" has no Spanish counterpart');
  });

  it('requires the same structure in both editions', () => {
    const errors = errorsAfter((m) => {
      guide(m, 'en', 'solid').order = 9;
      guide(m, 'en', 'builder-pattern').section = 'structural';
    });
    expect(errors).toContain('guide "solid": order differs between editions (es: 3, en: 9)');
    expect(errors).toContain(
      'guide "builder-pattern": section differs between editions (es: creational, en: structural)',
    );
  });

  it('rejects unknown topic, subtopic and section references', () => {
    const errors = errorsAfter((m) => {
      guide(m, 'es', 'solid').topic = 'design-principles';
      guide(m, 'es', 'what-is-testing').subtopic = 'claude-code';
      guide(m, 'es', 'data-architecture').section = 'data';
    });
    expect(errors).toContain('[es] guide "solid": unknown topic "design-principles"');
    expect(errors).toContain(
      '[es] guide "what-is-testing": subtopic "claude-code" belongs to topic "ai-engineering", not "testing"',
    );
    expect(errors).toContain(
      '[es] guide "data-architecture": section "data" is not declared by "architecture"',
    );
  });

  it('rejects declared sections with no guides', () => {
    const errors = errorsAfter(
      (m) => (guide(m, 'es', 'how-to-communicate-architecture-decisions').section = 'operations'),
    );
    expect(errors).toContain('[es] topic "architecture": section "decisions" has no guides');
  });

  it('rejects duplicate slugs and orders within a parent', () => {
    const errors = errorsAfter((m) => {
      guide(m, 'es', 'data-architecture').slug = 'domain-driven-design';
      guide(m, 'en', 'system-testing').order = 7;
    });
    expect(errors).toContain(
      '[es] topic "architecture": duplicate guide slug "domain-driven-design"',
    );
    expect(errors).toContain('[en] topic "testing": duplicate guide order 7');
  });

  it('allows the same slug under different parents', () => {
    expect(errorsAfter((m) => (guide(m, 'es', 'solid').slug = 'testing-de-sistema'))).toEqual([]);
  });

  it('rejects a guide slug that collides with a subtopic', () => {
    const errors = errorsAfter((m) => {
      for (const lang of ['es', 'en'] as const) {
        const g = guide(m, lang, 'what-is-claude-code');
        g.subtopic = undefined;
        g.section = undefined;
        g.slug = 'claude-code';
      }
    });
    expect(errors).toContain(
      '[es] guide "what-is-claude-code": slug "claude-code" collides with a subtopic of "ai-engineering"',
    );
  });

  it('rejects a Spanish topic slug that shadows the English edition', () => {
    expect(
      errorsAfter((m) => (m.es.topics.find((t) => t.id === 'testing')!.slug = 'en')),
    ).toContain('[es] topic "testing": slug "en" is reserved');
  });

  it('keeps Claude Code under AI Engineering', () => {
    const errors = errorsAfter((m) => {
      for (const lang of ['es', 'en'] as const) {
        m[lang].subtopics.find((s) => s.id === 'claude-code')!.topic = 'design';
      }
    });
    expect(errors).toContain(
      '[es] subtopic "claude-code" must live under topic "ai-engineering", not "design"',
    );
  });
});
