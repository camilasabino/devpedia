export const languages = ['es', 'en'] as const;
export type Lang = (typeof languages)[number];

export const ui = {
  es: {
    htmlLang: 'es',
    ogLocale: 'es_AR',
    homePath: '/',
    skipToContent: 'Saltar al contenido',
    languageSwitcher: 'Idioma',
    home: {
      title: 'DevPedia',
      description: 'DevPedia: guías de ingeniería de software sobre arquitectura, diseño, testing y AI engineering.',
      status: 'En construcción.',
    },
  },
  en: {
    htmlLang: 'en',
    ogLocale: 'en_US',
    homePath: '/en/',
    skipToContent: 'Skip to content',
    languageSwitcher: 'Language',
    home: {
      title: 'DevPedia',
      description: 'DevPedia: software engineering guides on architecture, design, testing and AI engineering.',
      status: 'Under construction.',
    },
  },
} as const satisfies Record<Lang, unknown>;
