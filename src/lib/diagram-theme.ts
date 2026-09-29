import type { MermaidConfig } from 'mermaid';

export type DiagramThemeName = 'dark' | 'light';

export interface DiagramPalette {
  fontFamily: string;
  fontSize: string;
  surface: string;
  node: string;
  nodeBorder: string;
  text: string;
  line: string;
  cluster: string;
  clusterBorder: string;
  edgeLabel: string;
  note: string;
  noteText: string;
  noteBorder: string;
  actorBorder: string;
  activation: string;
  sequenceNumber: string;
  ink: string;
  onFill: string;
}

const FONT_FAMILY = '"JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, monospace';
const FONT_SIZE = '15px';

export const DIAGRAM_FONT_PX = 15;
export const UML_FONT_PX = 12;
export const DIAGRAM_MIN_FONT_PX = 11;

export function diagramMinScale(renderedFontPx: number): number {
  return DIAGRAM_MIN_FONT_PX / renderedFontPx;
}

export function fitDiagramSvg(svg: SVGSVGElement, renderedFontPx = DIAGRAM_FONT_PX): void {
  const intrinsic = viewBoxWidth(svg);
  if (!intrinsic) {
    return;
  }
  svg.style.setProperty('--diagram-intrinsic', `${intrinsic}px`);
  svg.style.setProperty('--diagram-min-scale', String(diagramMinScale(renderedFontPx)));
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.style.removeProperty('width');
  svg.style.removeProperty('height');
  svg.style.removeProperty('max-width');
}

function viewBoxWidth(svg: SVGSVGElement): number {
  const width = Number(
    svg
      .getAttribute('viewBox')
      ?.trim()
      .split(/[\s,]+/)[2],
  );
  return Number.isFinite(width) ? width : 0;
}

const NOTE = '#fef3c7'; // amber-100
const NOTE_TEXT = '#78350f'; // amber-900
const NOTE_BORDER = '#b45309'; // amber-700
const INK = '#18181b';
const ON_FILL = '#ffffff';

const DARK: DiagramPalette = {
  fontFamily: FONT_FAMILY,
  fontSize: FONT_SIZE,
  surface: '#0f1114',
  node: '#1a1d22',
  nodeBorder: '#a1a1aa',
  text: '#fafafa',
  line: '#a1a1aa',
  cluster: '#14171c',
  clusterBorder: '#71717a',
  edgeLabel: '#1a1d22',
  note: NOTE,
  noteText: NOTE_TEXT,
  noteBorder: NOTE_BORDER,
  actorBorder: '#a1a1aa',
  activation: '#2a2e35',
  sequenceNumber: INK,
  ink: INK,
  onFill: ON_FILL,
};

const LIGHT: DiagramPalette = {
  fontFamily: FONT_FAMILY,
  fontSize: FONT_SIZE,
  surface: '#ffffff',
  node: '#ffffff',
  nodeBorder: '#52525b',
  text: INK,
  line: '#3f3f46',
  cluster: '#f4f4f5',
  clusterBorder: '#a1a1aa',
  edgeLabel: '#f4f4f5',
  note: NOTE,
  noteText: NOTE_TEXT,
  noteBorder: NOTE_BORDER,
  actorBorder: '#52525b',
  activation: '#e4e4e7',
  sequenceNumber: '#fafafa',
  ink: INK,
  onFill: ON_FILL,
};

export function diagramPalette(theme: DiagramThemeName): DiagramPalette {
  return theme === 'light' ? LIGHT : DARK;
}

export function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(hex: string): number {
  const [red, green, blue] = rgbChannels(hex);
  const channel = (value: number) => {
    const srgb = value / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
}

function rgbChannels(hex: string): [number, number, number] {
  const normalized = hex.trim().replace('#', '');
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((channel) => channel + channel)
          .join('')
      : normalized;
  return [
    Number.parseInt(expanded.slice(0, 2), 16),
    Number.parseInt(expanded.slice(2, 4), 16),
    Number.parseInt(expanded.slice(4, 6), 16),
  ];
}

export function inkForFill(fill: string, palette: DiagramPalette): string {
  if (!/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(fill)) {
    return palette.onFill;
  }
  return contrastRatio(palette.onFill, fill) >= 4.5 ? palette.onFill : palette.ink;
}

const C4_SHAPE_TYPES = [
  'person',
  'external_person',
  'system',
  'system_db',
  'system_queue',
  'external_system',
  'external_system_db',
  'external_system_queue',
  'container',
  'container_db',
  'container_queue',
  'external_container',
  'external_container_db',
  'external_container_queue',
  'component',
  'component_db',
  'component_queue',
  'external_component',
  'external_component_db',
  'external_component_queue',
] as const;

export function wrapClassDiagramNotes(source: string, maxChars = 48): string {
  if (!/^\s*classDiagram\b/.test(source)) {
    return source;
  }
  return source.replace(
    /(note(?:\s+for\s+[A-Za-z0-9_]+)?\s+")([^"]*)(")/g,
    (_match, prefix: string, body: string, suffix: string) =>
      `${prefix}${body
        .split('\n')
        .map((line) => wrapLine(line, maxChars))
        .join('\n')}${suffix}`,
  );
}

function wrapLine(line: string, maxChars: number): string {
  if (line.length <= maxChars) {
    return line;
  }
  const lines: string[] = [];
  let current = '';
  for (const word of line.split(' ')) {
    const next = current ? `${current} ${word}` : word;
    if (current && next.length > maxChars) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines.join('\n');
}

function themeCss(palette: DiagramPalette): string {
  return `
    g.classGroup text,
    .classLabel .label {
      fill: ${palette.text};
      font-size: 14px;
    }
    g.stateGroup text,
    .stateLabel text {
      fill: ${palette.text};
      font-size: 14px;
    }
    .noteLabel .nodeLabel,
    .noteLabel text,
    .noteText,
    .noteText > tspan,
    .statediagram-note text,
    .state-note text {
      fill: ${palette.noteText};
      color: ${palette.noteText};
    }
  `;
}

function c4Config(palette: DiagramPalette): MermaidConfig['c4'] {
  const config: Record<string, string | number | boolean> = {
    useMaxWidth: false,
    wrap: true,
    c4ShapeMargin: 72,
    diagramMarginX: 24,
    diagramMarginY: 28,
    messageFontSize: 14,
    messageFontFamily: palette.fontFamily,
    boundaryFontSize: 15,
    boundaryFontFamily: palette.fontFamily,
  };
  for (const type of C4_SHAPE_TYPES) {
    config[`${type}FontSize`] = 16;
    config[`${type}FontFamily`] = palette.fontFamily;
  }
  return config;
}

export function mermaidDiagramConfig(theme: DiagramThemeName): MermaidConfig {
  const palette = diagramPalette(theme);
  return {
    startOnLoad: false,
    theme: 'base',
    securityLevel: 'strict',
    htmlLabels: false,
    fontFamily: palette.fontFamily,
    themeCSS: themeCss(palette),
    themeVariables: {
      darkMode: theme === 'dark',
      fontFamily: palette.fontFamily,
      fontSize: palette.fontSize,
      background: 'transparent',
      primaryColor: palette.node,
      secondaryColor: palette.activation,
      tertiaryColor: palette.cluster,
      primaryTextColor: palette.text,
      secondaryTextColor: palette.text,
      tertiaryTextColor: palette.text,
      textColor: palette.text,
      nodeTextColor: palette.text,
      classText: palette.text,
      titleColor: palette.text,
      lineColor: palette.line,
      arrowheadColor: palette.line,
      defaultLinkColor: palette.line,
      primaryBorderColor: palette.nodeBorder,
      secondaryBorderColor: palette.nodeBorder,
      tertiaryBorderColor: palette.clusterBorder,
      nodeBkg: palette.node,
      mainBkg: palette.node,
      nodeBorder: palette.nodeBorder,
      clusterBkg: palette.cluster,
      clusterBorder: palette.clusterBorder,
      edgeLabelBackground: palette.edgeLabel,
      labelBackgroundColor: palette.edgeLabel,
      noteBkgColor: palette.note,
      noteTextColor: palette.noteText,
      noteBorderColor: palette.noteBorder,
      actorBkg: palette.node,
      actorBorder: palette.actorBorder,
      actorTextColor: palette.text,
      actorLineColor: palette.line,
      signalColor: palette.line,
      signalTextColor: palette.text,
      labelBoxBkgColor: palette.node,
      labelBoxBorderColor: palette.actorBorder,
      labelTextColor: palette.text,
      loopTextColor: palette.text,
      activationBkgColor: palette.activation,
      activationBorderColor: palette.line,
      sequenceNumberColor: palette.sequenceNumber,
      stateBkg: palette.node,
      stateLabelColor: palette.text,
      transitionColor: palette.line,
      transitionLabelColor: palette.text,
      compositeBackground: palette.cluster,
      compositeTitleBackground: palette.node,
      compositeBorder: palette.clusterBorder,
      altBackground: palette.cluster,
      relationColor: palette.line,
      relationLabelColor: palette.text,
      relationLabelBackground: palette.edgeLabel,
    },
    flowchart: {
      htmlLabels: false,
      useMaxWidth: false,
      wrappingWidth: 260,
      padding: 16,
      nodeSpacing: 48,
      rankSpacing: 56,
    },
    sequence: {
      useMaxWidth: false,
      wrap: true,
      width: 220,
      wrapPadding: 16,
      noteMargin: 14,
      actorMargin: 72,
      messageMargin: 48,
      boxMargin: 12,
      boxTextMargin: 8,
      actorFontFamily: palette.fontFamily,
      noteFontFamily: palette.fontFamily,
      messageFontFamily: palette.fontFamily,
      actorFontSize: 15,
      noteFontSize: 14,
      messageFontSize: 15,
    },
    class: {
      useMaxWidth: false,
      padding: 14,
    },
    state: {
      useMaxWidth: false,
      padding: 12,
    },
    er: {
      useMaxWidth: false,
    },
    c4: c4Config(palette),
  };
}

const C4_HARDCODED_DARK = new Set(['#444', '#444444']);

export function tuneDiagramSvg(svg: SVGSVGElement, theme: DiagramThemeName): void {
  const palette = diagramPalette(theme);

  for (const shape of svg.querySelectorAll<SVGGElement>('.c4-shape')) {
    const fill = shapeFill(shape);
    if (!fill) {
      continue;
    }
    const ink = inkForFill(fill, palette);
    shape.style.setProperty('color', ink, 'important');
    for (const label of shape.querySelectorAll<SVGElement>('.label, .label text, .label tspan')) {
      label.style.setProperty('color', ink, 'important');
      label.style.setProperty('fill', ink, 'important');
    }
  }

  if (theme === 'light') {
    return;
  }

  for (const element of svg.querySelectorAll<SVGElement>('[fill], [stroke]')) {
    if (element.closest('.note, .noteLabel, .statediagram-note, .state-note, .c4-shape')) {
      continue;
    }
    const fill = normalizeHex(element.getAttribute('fill'));
    if (fill && C4_HARDCODED_DARK.has(fill) && element.tagName.toLowerCase() === 'text') {
      element.setAttribute('fill', palette.text);
    }
    const stroke = normalizeHex(element.getAttribute('stroke'));
    if (stroke && C4_HARDCODED_DARK.has(stroke)) {
      element.setAttribute('stroke', palette.line);
    }
  }

  for (const marker of svg.querySelectorAll('marker')) {
    for (const part of marker.querySelectorAll<SVGElement>('path, circle, polygon')) {
      const fill = normalizeHex(part.getAttribute('fill'));
      if (fill === '#000' || fill === '#000000' || fill === 'black') {
        part.setAttribute('fill', palette.line);
      }
      const stroke = normalizeHex(part.getAttribute('stroke'));
      if (stroke === '#000' || stroke === '#000000' || stroke === 'black') {
        part.setAttribute('stroke', palette.line);
      }
    }
  }
}

function shapeFill(shape: Element): string | null {
  const candidates = [shape, ...shape.querySelectorAll('rect, path, polygon, ellipse, circle')];
  for (const candidate of candidates) {
    const style = candidate.getAttribute('style') ?? '';
    const fromStyle = /(?:^|;)\s*fill:\s*([^;!\s]+)/i.exec(style)?.[1];
    if (fromStyle && fromStyle !== 'none') {
      return fromStyle;
    }
    const attribute = candidate.getAttribute('fill');
    if (attribute && attribute !== 'none') {
      return attribute;
    }
  }
  return null;
}

function normalizeHex(value: string | null): string | null {
  if (!value) {
    return null;
  }
  const trimmed = value.trim().toLowerCase();
  if (trimmed === 'black') {
    return '#000000';
  }
  if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
    return `#${trimmed
      .slice(1)
      .split('')
      .map((channel) => channel + channel)
      .join('')}`;
  }
  return trimmed;
}
