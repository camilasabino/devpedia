export const languages = ['es', 'en'] as const;
export type Lang = (typeof languages)[number];

export const ui = {
  es: {
    htmlLang: 'es',
    ogLocale: 'es_AR',
    homePath: '/',
    skipToContent: 'Saltar al contenido',
    languageSwitcher: 'Idioma',
    breadcrumb: 'Ruta de navegación',
    home: {
      title: 'DevPedia',
      description: 'DevPedia: guías de ingeniería de software sobre arquitectura, diseño, testing y AI engineering.',
      status: 'En construcción.',
      topicsHeading: 'Temas',
    },
    hub: {
      subtopicsHeading: 'Subtemas',
      guidesCount: { one: '{count} guía', other: '{count} guías' },
    },
    guide: {
      lastUpdated: 'Última actualización',
      callout: {
        note: 'Nota',
        warning: 'Atención',
        key: 'Idea central',
      },
      diagram: {
        zoomLabel: 'Ampliar',
        zoomSrSuffix: ' diagrama: {caption}',
        closeLabel: 'Cerrar diagrama ampliado',
        scrollRegionLabel: 'Diagrama ampliado (desplazable)',
        fallbackName: 'Diagrama',
        renderError: '// no se pudo renderizar el diagrama',
        kinds: {
          classDiagram: 'Diagrama de clases',
          sequenceDiagram: 'Diagrama de secuencia',
          stateDiagram: 'Diagrama de estados',
          erDiagram: 'Diagrama entidad-relación',
          c4Context: 'Diagrama de contexto C4',
          c4Container: 'Diagrama de contenedores C4',
          c4Component: 'Diagrama de componentes C4',
          flowchart: 'Diagrama de flujo',
        },
      },
      permissionCascade: {
        yes: 'Sí',
        no: 'No → sigue',
        fallback: 'Si ninguna regla coincide: {fallback}',
      },
    },
  },
  en: {
    htmlLang: 'en',
    ogLocale: 'en_US',
    homePath: '/en/',
    skipToContent: 'Skip to content',
    languageSwitcher: 'Language',
    breadcrumb: 'Breadcrumb',
    home: {
      title: 'DevPedia',
      description: 'DevPedia: software engineering guides on architecture, design, testing and AI engineering.',
      status: 'Under construction.',
      topicsHeading: 'Topics',
    },
    hub: {
      subtopicsHeading: 'Subtopics',
      guidesCount: { one: '{count} guide', other: '{count} guides' },
    },
    guide: {
      lastUpdated: 'Last updated',
      callout: {
        note: 'Note',
        warning: 'Heads-up',
        key: 'Key idea',
      },
      diagram: {
        zoomLabel: 'Enlarge',
        zoomSrSuffix: ' diagram: {caption}',
        closeLabel: 'Close enlarged diagram',
        scrollRegionLabel: 'Enlarged diagram (scrollable)',
        fallbackName: 'Diagram',
        renderError: '// could not render the diagram',
        kinds: {
          classDiagram: 'Class diagram',
          sequenceDiagram: 'Sequence diagram',
          stateDiagram: 'State diagram',
          erDiagram: 'Entity-relationship diagram',
          c4Context: 'C4 context diagram',
          c4Container: 'C4 container diagram',
          c4Component: 'C4 component diagram',
          flowchart: 'Flowchart',
        },
      },
      permissionCascade: {
        yes: 'Yes',
        no: 'No → keep going',
        fallback: 'If no rule matches: {fallback}',
      },
    },
  },
} as const satisfies Record<Lang, unknown>;

/**
 * Fills `{name}` placeholders in a UI string, so each language can put the variable
 * where its own grammar wants it.
 */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

/** Picks the singular or plural form and fills `{count}`. */
export function plural(forms: { one: string; other: string }, count: number): string {
  return format(count === 1 ? forms.one : forms.other, { count });
}

/**
 * The language a page belongs to, read from its path. Components embedded in MDX
 * (callouts, diagrams) cannot be handed a `lang` prop from the page, so they read it
 * from the URL they are being rendered into.
 */
export function langFromPath(pathname: string): Lang {
  return /^\/en(\/|$)/.test(pathname) ? 'en' : 'es';
}
