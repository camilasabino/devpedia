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
    nav: {
      label: 'Principal',
      topics: 'Temas',
      search: 'Buscar',
    },
    footer: {
      createdBy: 'Creado por',
      githubLabel: 'GitHub de Camila Sabino',
    },
    search: {
      triggerLabel: 'Buscar guías',
      dialogLabel: 'Buscar en DevPedia',
      placeholder: 'Buscar guías...',
      closeLabel: 'Cerrar buscador',
      showAll: 'Mostrar todos',
      resultCount: { one: '1 resultado', other: '{count} resultados' },
      showing: 'Mostrando {shown} de {total}',
      empty: '// sin resultados para &ldquo;{query}&rdquo;',
      emptyHint: 'Probá con otro término.',
      unavailable: 'El buscador no está disponible en este momento.',
    },
    home: {
      description:
        'Un handbook estructurado para entender los conceptos, prácticas y trade-offs de Software Engineering: arquitectura, diseño, testing, AI Engineering y más.',
      lead: 'Entendé los conceptos, las decisiones y los trade-offs que hay detrás de construir mejor software.',
      cta: 'Explorar temas',
      topicsHeading: 'Explorar por tema',
    },
    hub: {
      subtopicsHeading: 'Subtemas',
      sectionsLabel: 'Secciones de {title}',
      guidesCount: { one: '{count} guía', other: '{count} guías' },
    },
    guide: {
      updated: 'Actualizado',
      readingTime: '{minutes} min de lectura',
      position: 'Guía {position} de {total}',
      toc: {
        label: 'En esta guía',
        eyebrow: '// en esta guía',
      },
      headingAnchor: 'Enlace a «{heading}»',
      pager: {
        label: 'Guías de {parent}',
        previous: 'Anterior',
        next: 'Siguiente',
      },
      share: {
        label: 'Compartir esta guía',
        eyebrow: '// compartir',
        copy: 'Copiar enlace',
        copied: 'Enlace copiado',
        copyError: 'No se pudo copiar',
        linkedin: 'Compartir en LinkedIn',
        x: 'Compartir en X',
        newTab: '(se abre en una pestaña nueva)',
      },
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
    nav: {
      label: 'Main',
      topics: 'Topics',
      search: 'Search',
    },
    footer: {
      createdBy: 'Created by',
      githubLabel: "Camila Sabino's GitHub",
    },
    search: {
      triggerLabel: 'Search guides',
      dialogLabel: 'Search DevPedia',
      placeholder: 'Search guides...',
      closeLabel: 'Close search',
      showAll: 'Show all',
      resultCount: { one: '1 result', other: '{count} results' },
      showing: 'Showing {shown} of {total}',
      empty: '// no results for &ldquo;{query}&rdquo;',
      emptyHint: 'Try another term.',
      unavailable: 'Search is currently unavailable.',
    },
    home: {
      description:
        'A structured handbook for learning Software Engineering concepts, practices and trade-offs across architecture, design, testing, AI Engineering and more.',
      lead: 'Understand the concepts, decisions and trade-offs behind better software.',
      cta: 'Explore topics',
      topicsHeading: 'Explore by topic',
    },
    hub: {
      subtopicsHeading: 'Subtopics',
      sectionsLabel: 'Sections of {title}',
      guidesCount: { one: '{count} guide', other: '{count} guides' },
    },
    guide: {
      updated: 'Updated',
      readingTime: '{minutes} min read',
      position: 'Guide {position} of {total}',
      toc: {
        label: 'On this page',
        eyebrow: '// on this page',
      },
      headingAnchor: 'Link to “{heading}”',
      pager: {
        label: '{parent} guides',
        previous: 'Previous',
        next: 'Next',
      },
      share: {
        label: 'Share this guide',
        eyebrow: '// share',
        copy: 'Copy link',
        copied: 'Link copied',
        copyError: 'Could not copy',
        linkedin: 'Share on LinkedIn',
        x: 'Share on X',
        newTab: '(opens in a new tab)',
      },
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
