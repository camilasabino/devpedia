/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest';
import {
  DIAGRAM_FONT_PX,
  DIAGRAM_MIN_FONT_PX,
  contrastRatio,
  diagramMinScale,
  diagramPalette,
  fitDiagramSvg,
  inkForFill,
  mermaidDiagramConfig,
  tuneDiagramSvg,
  wrapClassDiagramNotes,
  type DiagramThemeName,
} from '@/lib/diagram-theme';

const AA = 4.5;

function expectReadable(foreground: string, background: string) {
  expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(AA);
}

describe('diagram palette', () => {
  it.each(['dark', 'light'] as DiagramThemeName[])(
    'keeps meaningful text above WCAG AA on %s',
    (theme) => {
      const palette = diagramPalette(theme);
      expectReadable(palette.text, palette.surface);
      expectReadable(palette.text, palette.node);
      expectReadable(palette.text, palette.cluster);
      expectReadable(palette.text, palette.edgeLabel);
      expectReadable(palette.text, palette.activation);
      expectReadable(palette.noteText, palette.note);
      expectReadable(palette.sequenceNumber, palette.line);
      for (const color of [palette.text, palette.noteText, palette.line, palette.node]) {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      }
    },
  );

  it('picks dark ink for light C4 fills and white ink for dark ones', () => {
    const palette = diagramPalette('dark');
    expect(inkForFill('#85BBF0', palette)).toBe(palette.ink);
    expect(inkForFill('#CCCCCC', palette)).toBe(palette.ink);
    expect(inkForFill('#1168BD', palette)).toBe(palette.onFill);
    expect(inkForFill('#08427B', palette)).toBe(palette.onFill);
  });

  it('wraps labels and keeps Mermaid geometry intrinsic', () => {
    const config = mermaidDiagramConfig('dark');
    expect(config.sequence?.wrap).toBe(true);
    expect(config.sequence?.useMaxWidth).toBe(false);
    expect(config.flowchart?.useMaxWidth).toBe(false);
    expect(config.flowchart?.wrappingWidth).toBeGreaterThan(200);
    expect(config.class?.useMaxWidth).toBe(false);
    expect(config.c4?.wrap).toBe(true);
    expect(config.themeCSS).toContain(diagramPalette('dark').noteText);
    expect(config.themeCSS).toContain('g.classGroup text');
  });
});

describe('wrapClassDiagramNotes', () => {
  it('wraps long note lines and leaves other diagrams untouched', () => {
    const source = `classDiagram
    note for ReportGenerator "generate() es el template method: es final y fija el orden.
Los métodos en cursiva son abstractos; buildHeader y buildFooter son hooks con default."`;
    const wrapped = wrapClassDiagramNotes(source, 48);
    expect(wrapped).not.toBe(source);
    for (const line of wrapped.split('\n')) {
      expect(line.replace(/^.*"/, '').replace(/"$/, '').length).toBeLessThanOrEqual(48);
    }
    expect(
      wrapClassDiagramNotes(
        'sequenceDiagram\n    Note over A: un texto largo que no es una nota de clase',
      ),
    ).toContain('un texto largo');
  });

  it('keeps short notes on one line', () => {
    const source = 'classDiagram\n    note for Box "Short note."';
    expect(wrapClassDiagramNotes(source)).toBe(source);
  });
});

describe('tuneDiagramSvg', () => {
  it('darkens text on light C4 boxes and lifts hardcoded relation labels', () => {
    document.body.innerHTML = `
      <svg>
        <g class="c4-shape c4-component" style="fill:#85BBF0">
          <rect style="fill:#85BBF0"></rect>
          <g class="label"><text style="color:#ffffff;fill:#ffffff">Payment Service</text></g>
        </g>
        <g class="c4-shape c4-system" style="fill:#1168BD">
          <rect style="fill:#1168BD"></rect>
          <g class="label"><text>E-commerce</text></g>
        </g>
        <text fill="#444444">Invoca</text>
        <line stroke="#444444"></line>
        <g class="note"><text fill="#444444">keep</text></g>
      </svg>`;
    const svg = document.querySelector('svg') as unknown as SVGSVGElement;
    tuneDiagramSvg(svg, 'dark');

    const component = document.querySelector('.c4-component text') as HTMLElement;
    const system = document.querySelector('.c4-system text') as HTMLElement;
    const relation = document.querySelector('svg > text') as SVGTextElement;
    const note = document.querySelector('.note text') as SVGTextElement;

    expect(component.style.fill).toBe('#18181b');
    expect(system.style.fill).toBe('#ffffff');
    expect(relation.getAttribute('fill')).toBe('#fafafa');
    expect(document.querySelector('line')?.getAttribute('stroke')).toBe('#a1a1aa');
    expect(note.getAttribute('fill')).toBe('#444444');
  });
});

describe('fitDiagramSvg', () => {
  it('caps each diagram at its own viewBox and keeps a readable floor', () => {
    document.body.innerHTML = `<svg viewBox="0 0 900 400" width="900" height="400" style="max-width: 900px"></svg>`;
    const svg = document.querySelector('svg') as unknown as SVGSVGElement;
    fitDiagramSvg(svg);

    expect(svg.getAttribute('width')).toBeNull();
    expect(svg.getAttribute('height')).toBeNull();
    expect(svg.getAttribute('viewBox')).toBe('0 0 900 400');
    expect(svg.style.getPropertyValue('--diagram-intrinsic')).toBe('900px');
    expect(Number(svg.style.getPropertyValue('--diagram-min-scale'))).toBeCloseTo(
      diagramMinScale(DIAGRAM_FONT_PX),
    );
    expect(diagramMinScale(DIAGRAM_FONT_PX)).toBe(DIAGRAM_MIN_FONT_PX / DIAGRAM_FONT_PX);
    expect(svg.style.maxWidth).toBe('');
  });
});
