import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { Window } from 'happy-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Search from '../src/components/Search.astro';
import { initializeSearch } from '@/components/search/search-controller';

const rendered = new Map<'es' | 'en', string>();
let page: Window | undefined;

afterEach(async () => {
  page?.happyDOM.abort();
  page = undefined;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('SearchDialog clear', () => {
  it('hides the clear control while the query is empty', async () => {
    const { clear } = await openSearch('es');

    expect(clear.hidden).toBe(true);
  });

  it('shows the clear control once the query has text', async () => {
    const { input, clear } = await openSearch('es');

    await typeQuery(input, 'hexagonal');

    expect(clear.hidden).toBe(false);
    expect(input.hasAttribute('data-query')).toBe(true);
  });

  it('clears the query and its results without closing the dialog', async () => {
    const { dialog, input, results, status, clear } = await openSearch('es');
    const url = page!.location.href;
    await typeQuery(input, 'hexagonal');
    expect(results.textContent).toContain('El buscador no está disponible en este momento.');

    clear.click();

    expect(input.value).toBe('');
    expect(dialog.open).toBe(true);
    expect(results.textContent).toContain('Buscá por concepto, patrón o práctica.');
    expect(results.textContent).not.toContain('no está disponible');
    expect(status.textContent).toBe('');
    expect(clear.hidden).toBe(true);
    expect(input.hasAttribute('data-query')).toBe(false);
    expect(page!.location.href).toBe(url);
  });

  it('drops an in-flight search so stale results do not replace the idle state', async () => {
    const { input, results, clear } = await openSearch('es');
    input.value = 'hexagonal';
    input.dispatchEvent(new page!.Event('input', { bubbles: true }));

    clear.click();
    await vi.waitFor(() => {
      expect(results.textContent).toContain('Buscá por concepto, patrón o práctica.');
    });

    expect(results.textContent).not.toContain('no está disponible');
    expect(results.textContent).not.toContain('Buscando…');
  });

  it('returns focus to the input after clearing', async () => {
    const { input, clear } = await openSearch('es');
    await typeQuery(input, 'hexagonal');
    clear.focus();

    clear.click();

    expect(page!.document.activeElement).toBe(input);
  });

  it('accepts a new query immediately after clearing', async () => {
    const { dialog, input, results, clear } = await openSearch('es');
    await typeQuery(input, 'hexagonal');
    clear.click();

    await typeQuery(input, 'arquitectura');

    expect(dialog.open).toBe(true);
    expect(input.value).toBe('arquitectura');
    expect(page!.document.activeElement).toBe(input);
    expect(results.textContent).toContain('El buscador no está disponible en este momento.');
  });

  it('activates clear from the button, including keyboard focus', async () => {
    const { input, clear } = await openSearch('es');
    await typeQuery(input, 'hexagonal');

    expect(clear.tagName).toBe('BUTTON');
    expect(clear.getAttribute('type')).toBe('button');
    clear.focus();
    expect(page!.document.activeElement).toBe(clear);

    clear.click();

    expect(input.value).toBe('');
    expect(page!.document.activeElement).toBe(input);
  });

  it('still closes the dialog from the close button', async () => {
    const { dialog, input, close, trigger } = await openSearch('es');
    await typeQuery(input, 'hexagonal');

    close.click();

    expect(dialog.open).toBe(false);
    expect(page!.document.activeElement).toBe(trigger);
  });

  it('still closes the dialog when Escape cancels it', async () => {
    const { dialog, input } = await openSearch('es');
    await typeQuery(input, 'hexagonal');

    pressEscape(dialog);

    expect(dialog.open).toBe(false);
  });

  it('names the clear control in Spanish and keeps the close label', async () => {
    const { document } = await parsedSearch('es');
    const clear = required(
      document.getElementById('search-clear'),
      document.defaultView!.HTMLButtonElement,
    );
    const close = required(
      document.getElementById('search-close'),
      document.defaultView!.HTMLButtonElement,
    );
    const field = required(
      document.getElementById('search-input'),
      document.defaultView!.HTMLInputElement,
    );

    expect(clear.getAttribute('aria-label')).toBe('Limpiar búsqueda');
    expect(clear.getAttribute('title')).toBeNull();
    expect(close.getAttribute('aria-label')).toBe('Cerrar buscador');
    expect(field.getAttribute('placeholder')).toBe('Buscar guías y temas…');
    expect(clear.querySelector('circle')).not.toBeNull();
    expect(close.querySelector('circle')).toBeNull();
  });

  it('names the clear control in English and keeps the close label', async () => {
    const { document } = await parsedSearch('en');
    const clear = required(
      document.getElementById('search-clear'),
      document.defaultView!.HTMLButtonElement,
    );
    const close = required(
      document.getElementById('search-close'),
      document.defaultView!.HTMLButtonElement,
    );
    const field = required(
      document.getElementById('search-input'),
      document.defaultView!.HTMLInputElement,
    );

    expect(clear.getAttribute('aria-label')).toBe('Clear search');
    expect(close.getAttribute('aria-label')).toBe('Close search');
    expect(field.getAttribute('placeholder')).toBe('Search guides and topics…');
  });

  it('keeps a single clear control because the field is not a native search input', async () => {
    const { document } = await parsedSearch('es');
    const field = required(
      document.getElementById('search-input'),
      document.defaultView!.HTMLInputElement,
    );

    expect(field.getAttribute('type')).toBe('text');
    expect(document.querySelector('input[type="search"]')).toBeNull();
    expect(document.querySelectorAll('#search-clear')).toHaveLength(1);
    expect(field.className).toContain('data-[query]:pr-9');
  });
});

async function searchMarkup(lang: 'es' | 'en'): Promise<string> {
  const cached = rendered.get(lang);
  if (cached) {
    return cached;
  }
  const container = await AstroContainer.create();
  const html = await container.renderToString(Search, { props: { lang } });
  rendered.set(lang, html);
  return html;
}

async function parsedSearch(lang: 'es' | 'en') {
  const html = await searchMarkup(lang);
  const view = new Window();
  view.document.body.innerHTML = html;
  return { document: view.document, view };
}

async function openSearch(lang: 'es' | 'en') {
  const view = new Window({ url: 'https://devpedia.test/' });
  page = view;
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  stubDom(view);

  const html = await searchMarkup(lang);
  view.document.body.innerHTML = `${html}<button id="search-trigger" type="button">Buscar</button>`;

  const clear = view.document.getElementById('search-clear');
  expect(clear).toBeInstanceOf(view.HTMLButtonElement);

  initializeSearch();
  const trigger = required(view.document.getElementById('search-trigger'), view.HTMLButtonElement);
  trigger.click();

  return {
    dialog: required(view.document.getElementById('search-dialog'), view.HTMLDialogElement),
    input: required(view.document.getElementById('search-input'), view.HTMLInputElement),
    clear: required(clear, view.HTMLButtonElement),
    close: required(view.document.getElementById('search-close'), view.HTMLButtonElement),
    trigger,
    results: required(view.document.getElementById('search-results'), view.HTMLElement),
    status: required(view.document.getElementById('search-status'), view.HTMLElement),
  };
}

function stubDom(view: Window) {
  vi.stubGlobal('window', view);
  vi.stubGlobal('document', view.document);
  vi.stubGlobal('location', view.location);
  vi.stubGlobal('HTMLElement', view.HTMLElement);
  vi.stubGlobal('HTMLDialogElement', view.HTMLDialogElement);
  vi.stubGlobal('HTMLButtonElement', view.HTMLButtonElement);
  vi.stubGlobal('HTMLInputElement', view.HTMLInputElement);
  vi.stubGlobal('Element', view.Element);
  vi.stubGlobal('Event', view.Event);
  vi.stubGlobal('KeyboardEvent', view.KeyboardEvent);
}

async function typeQuery(input: InstanceType<Window['HTMLInputElement']>, value: string) {
  input.focus();
  input.value = value;
  input.dispatchEvent(new page!.Event('input', { bubbles: true }));
  await vi.waitFor(() => {
    expect(page!.document.getElementById('search-results')?.textContent).toContain(
      'El buscador no está disponible en este momento.',
    );
  });
}

// Browsers close a modal dialog on Escape by firing `cancel`, then `close` unless
// the cancel event was prevented. happy-dom does not implement that user-agent step.
function pressEscape(dialog: InstanceType<Window['HTMLDialogElement']>) {
  const keydown = new page!.KeyboardEvent('keydown', {
    key: 'Escape',
    code: 'Escape',
    bubbles: true,
    cancelable: true,
  });
  dialog.dispatchEvent(keydown);
  if (keydown.defaultPrevented) {
    return;
  }
  const cancel = new page!.Event('cancel', { bubbles: true, cancelable: true });
  dialog.dispatchEvent(cancel);
  if (!cancel.defaultPrevented) {
    dialog.close();
  }
}

function required<T>(element: unknown, type: abstract new (...args: never[]) => T): T {
  expect(element).toBeInstanceOf(type);
  if (typeof element !== 'object' || element === null || !(element instanceof type)) {
    throw new Error('missing search element');
  }
  return element;
}
