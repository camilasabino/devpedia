// Post-processing applied to every rendered guide body. Two concerns, both of
// which are structural rather than authorial, so they belong here instead of in the
// .mdx sources:
//
//   1. Table scrolling — the scroll container has to be a wrapper element. Setting
//      `display: block` on the <table> itself strips its table role in several
//      screen readers, which loses the row/column association.
//
// Heading anchors are NOT added here: Astro's built-in slugger runs after user
// rehype plugins, so the headings have no `id` yet at this point. They are added
// client-side by the page instead.
//   2. Keyboard-scrollable regions — a container that scrolls must be reachable by
//      keyboard (WCAG 2.1.1). Both the table wrapper and <pre> get `tabindex="0"`.

// The accessible name of the scroll wrapper is the one piece of generated text in
// this plugin, so it has to follow the guide's language. Astro applies one global
// markdown pipeline, so the language is read from the source path instead of a
// per-collection option: English guides live under `src/content/guides/en/`.
const TABLE_SCROLL_LABEL = {
  es: 'Tabla con desplazamiento horizontal',
  en: 'Horizontally scrollable table',
} as const;

interface VFileLike {
  path?: string;
  history?: string[];
}

function labelForFile(file: VFileLike | undefined): string {
  const path = file?.path ?? file?.history?.[0] ?? '';
  return path.includes('/content/guides/en/') ? TABLE_SCROLL_LABEL.en : TABLE_SCROLL_LABEL.es;
}

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function isElement(node: HastNode, tagName: string): boolean {
  return node.type === 'element' && node.tagName === tagName;
}

function wrapTable(table: HastNode, label: string): HastNode {
  return {
    type: 'element',
    tagName: 'div',
    properties: {
      className: ['table-scroll'],
      tabindex: 0,
      role: 'region',
      'aria-label': label,
    },
    children: [table],
  };
}

function transformChildren(parent: HastNode, label: string): void {
  if (!parent.children) {
    return;
  }

  const next: HastNode[] = [];

  for (const node of parent.children) {
    if (node.type !== 'element') {
      next.push(node);
      continue;
    }

    if (isElement(node, 'table')) {
      // The table's own subtree needs no further treatment, and the wrapper must
      // not be revisited — walking into it would find the table again and wrap it
      // a second time, forever.
      next.push(wrapTable(node, label));
      continue;
    }

    if (isElement(node, 'pre')) {
      node.properties = { ...node.properties, tabindex: 0 };
      next.push(node);
      continue;
    }

    transformChildren(node, label);
    next.push(node);
  }

  parent.children = next;
}

export function rehypeGuideEnhancements() {
  return (tree: HastNode, file?: VFileLike) => {
    transformChildren(tree, labelForFile(file));
  };
}
