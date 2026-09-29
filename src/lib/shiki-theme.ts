import type { ShikiTransformer, ThemeRegistrationRaw } from 'shiki';

const TYPE_REFERENCE_DARK = '#38bdf8'; // sky-400
const TYPE_REFERENCE_LIGHT = '#0369a1'; // sky-700
const JDK_TYPE_DARK = '#a3e635'; // lime-400
const JDK_TYPE_LIGHT = '#3f6212'; // lime-800

// Java's TextMate grammar has no notion of "a known JDK type" — `String` and a
// user's own `Shipment` both just get scoped as "a type name", since a syntax
// grammar has no symbol table. To still tell them apart (as a real IDE with a real
// compiler behind it can), this transformer re-colors an explicit, curated list of
// the JDK/stdlib names that actually show up in the guides' Java snippets, after
// the grammar-based theme above has already colored everything else.
const JDK_TYPE_NAMES = new Set([
  // primitives
  'void', 'int', 'boolean', 'long', 'double', 'float', 'char', 'byte', 'short',
  // java.lang / java.util types used across the design patterns snippets
  'String', 'StringBuilder', 'Integer', 'Long', 'Double', 'Float', 'Boolean', 'Character',
  'Object', 'Math', 'System', 'Class', 'Number',
  'List', 'ArrayList', 'LinkedList', 'Map', 'HashMap', 'ConcurrentHashMap', 'TreeMap',
  'Set', 'HashSet', 'TreeSet', 'Queue', 'Deque', 'Iterator', 'Iterable',
  'Comparable', 'Comparator', 'Optional', 'Collections', 'Collection', 'Runnable', 'Thread',
  'Exception', 'RuntimeException', 'IllegalStateException', 'IllegalArgumentException',
  'UnsupportedOperationException', 'NullPointerException',
  'Cloneable', 'Serializable',
]);

function recolor(value: string | undefined, from: string, to: string): string | undefined {
  return value?.toLowerCase() === from ? to : value;
}

export const jdkTypeTransformer: ShikiTransformer = {
  name: 'jdk-type-names',
  tokens(lines) {
    for (const line of lines) {
      for (const token of line) {
        if (!JDK_TYPE_NAMES.has(token.content.trim())) continue;

        // Single-theme path (token.color) and dual-theme path (htmlStyle + CSS vars).
        token.color = recolor(token.color, TYPE_REFERENCE_DARK, JDK_TYPE_DARK);
        const style = token.htmlStyle;
        if (!style) continue;
        const nextColor = recolor(style.color, TYPE_REFERENCE_DARK, JDK_TYPE_DARK);
        if (nextColor) style.color = nextColor;
        const nextDark = recolor(style['--shiki-dark'], TYPE_REFERENCE_DARK, JDK_TYPE_DARK);
        if (nextDark) style['--shiki-dark'] = nextDark;
        const nextLight = recolor(style['--shiki-light'], TYPE_REFERENCE_LIGHT, JDK_TYPE_LIGHT);
        if (nextLight) style['--shiki-light'] = nextLight;
      }
    }
    return lines;
  },
};

type TokenColors = {
  foreground: string;
  comment: string;
  string: string;
  constant: string;
  keyword: string;
  className: string;
  typeReference: string;
  functionName: string;
  parameter: string;
  punctuation: string;
};

// Same TextMate scopes in both themes so toggling light/dark keeps the same
// semantic roles (keyword, string, declared class, referenced type, …) — the
// differentiation a real editor theme makes, instead of Shiki's built-in
// "css-variables" theme, which collapses most of those into one bucket.
function makeTheme(
  name: string,
  type: 'dark' | 'light',
  colors: TokenColors,
): ThemeRegistrationRaw {
  return {
    name,
    type,
    settings: [
      {
        settings: {
          foreground: colors.foreground,
          background: '#00000000',
        },
      },
      {
        scope: ['comment'],
        settings: { foreground: colors.comment, fontStyle: 'italic' },
      },
      {
        scope: ['string', 'string.quoted'],
        settings: { foreground: colors.string },
      },
      {
        scope: [
          'constant.numeric',
          'constant.language',
          'constant.other',
          'constant.character.escape',
        ],
        settings: { foreground: colors.constant },
      },
      {
        scope: [
          'keyword',
          'keyword.control',
          'keyword.operator',
          'keyword.other',
          'keyword.reserved',
          'storage.modifier',
        ],
        settings: { foreground: colors.keyword },
      },
      {
        // The class/interface/enum/record NAME at its declaration site.
        scope: [
          'entity.name.type',
          'meta.class.identifier',
        ],
        settings: { foreground: colors.className },
      },
      {
        // A type USED elsewhere (a field/parameter/return type, a built-in type,
        // an implemented/extended interface referenced by name) — distinct from the
        // class-declaration color above, the same way a real editor tells apart
        // "the class you're defining" from "a type you're referencing".
        scope: [
          'storage.type',
          'entity.other.inherited-class',
          'support.type',
          'support.class',
        ],
        settings: { foreground: colors.typeReference },
      },
      {
        scope: ['entity.name.function', 'support.function'],
        settings: { foreground: colors.functionName },
      },
      {
        scope: ['variable.parameter'],
        settings: { foreground: colors.parameter },
      },
      {
        scope: ['punctuation'],
        settings: { foreground: colors.punctuation },
      },
    ],
  };
}

export const shikiThemeDark = makeTheme('camila-dev-dark', 'dark', {
  foreground: '#e5e5e5', // neutral-200 — plain identifiers (variables, fields)
  comment: '#737373', // neutral-500
  string: '#7fe6d9', // accent-300 (teal)
  constant: '#fbbf24', // amber-400
  keyword: '#a78bfa', // violet-400
  className: '#e879f9', // fuchsia-400
  typeReference: TYPE_REFERENCE_DARK,
  functionName: '#60a5fa', // blue-400
  parameter: '#d4d4d4', // neutral-300
  punctuation: '#737373', // neutral-500
});

// Light counterpart: same hue families as the dark theme, darkened to the
// range a light IDE uses (One Light / IntelliJ Light / VS Code Light+).
export const shikiThemeLight = makeTheme('camila-dev-light', 'light', {
  foreground: '#3f3f46', // zinc-700
  comment: '#5c5c64',
  string: '#0f766e', // accent-700 (teal)
  constant: '#b45309', // amber-700
  keyword: '#6d28d9', // violet-700
  className: '#a21caf', // fuchsia-700
  typeReference: TYPE_REFERENCE_LIGHT,
  functionName: '#1d4ed8', // blue-700
  parameter: '#52525b', // zinc-600
  punctuation: '#71717a', // zinc-500
});
