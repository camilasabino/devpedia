// Opens every external link in guide content (plain Markdown `[text](url)` links,
// rendered as regular <a> nodes in the HAST tree) in a new tab, so following a
// reference doesn't interrupt reading the guide itself. Internal links (relative,
// or `/`-rooted) are left alone — those should keep navigating in the same tab.
// JSX <a> tags written directly in .mdx files aren't HAST elements at this stage
// (MDX keeps them as JSX nodes), so authors still set target="_blank" on those by hand.

interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function isExternalHref(href: unknown): href is string {
  return typeof href === 'string' && /^https?:\/\//i.test(href);
}

function visit(node: HastNode) {
  if (node.type === 'element' && node.tagName === 'a' && isExternalHref(node.properties?.href)) {
    node.properties = {
      ...node.properties,
      target: '_blank',
      rel: 'noopener noreferrer',
    };
  }
  node.children?.forEach(visit);
}

export function rehypeExternalLinks() {
  return (tree: HastNode) => {
    visit(tree);
  };
}
