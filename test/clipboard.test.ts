import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyText } from '../src/lib/clipboard';

interface FakeTextarea {
  value: string;
  style: Record<string, string>;
  setAttribute: (name: string, value: string) => void;
  select: () => void;
  remove: () => void;
}

function stubDom(execCommandResult: boolean | (() => never)) {
  const created: FakeTextarea[] = [];
  const appended: FakeTextarea[] = [];
  const removed: FakeTextarea[] = [];

  const document = {
    createElement: () => {
      const node: FakeTextarea = {
        value: '',
        style: {},
        setAttribute: () => {},
        select: () => {},
        remove: () => removed.push(node),
      };
      created.push(node);
      return node;
    },
    body: { appendChild: (node: FakeTextarea) => appended.push(node) },
    execCommand: () => {
      if (typeof execCommandResult === 'function') return execCommandResult();
      return execCommandResult;
    },
  };

  vi.stubGlobal('document', document);
  return { created, appended, removed };
}

// Node defines `navigator` as a getter-only global, so both globals are stubbed
// through vitest instead of plain assignment.
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('copyText', () => {
  it('uses the clipboard api when it is available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    stubDom(true);

    await expect(copyText('https://devpedia.camilasabino.dev/testing/')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('https://devpedia.camilasabino.dev/testing/');
  });

  it('falls back to execCommand when the clipboard api is missing', async () => {
    vi.stubGlobal('navigator', {});
    const dom = stubDom(true);

    await expect(copyText('https://devpedia.camilasabino.dev/testing/')).resolves.toBe(true);
    expect(dom.created).toHaveLength(1);
    expect(dom.created[0].value).toBe('https://devpedia.camilasabino.dev/testing/');
    expect(dom.appended).toHaveLength(1);
  });

  it('falls back to execCommand when the clipboard api rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('not allowed'));
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    const dom = stubDom(true);

    await expect(copyText('x')).resolves.toBe(true);
    expect(dom.created).toHaveLength(1);
  });

  it('removes the textarea even when execCommand throws', async () => {
    vi.stubGlobal('navigator', {});
    const dom = stubDom(() => {
      throw new Error('blocked');
    });

    await expect(copyText('x')).resolves.toBe(false);
    expect(dom.removed).toHaveLength(1);
  });

  it('reports failure when execCommand returns false', async () => {
    vi.stubGlobal('navigator', {});
    stubDom(false);

    await expect(copyText('x')).resolves.toBe(false);
  });

  it('resolves false without rejecting when appendChild throws', async () => {
    vi.stubGlobal('navigator', {});
    const document = {
      createElement: () => ({
        value: '',
        style: {},
        setAttribute: () => {},
        select: () => {},
        remove: () => {},
      }),
      body: {
        appendChild: () => {
          throw new Error('body not ready');
        },
      },
      execCommand: () => true,
    };
    vi.stubGlobal('document', document);

    await expect(copyText('x')).resolves.toBe(false);
  });

  it('resolves false without rejecting when select throws', async () => {
    vi.stubGlobal('navigator', {});
    const removed: unknown[] = [];
    const document = {
      createElement: () => ({
        value: '',
        style: {},
        setAttribute: () => {},
        select: () => {
          throw new Error('detached node');
        },
        remove: () => removed.push(true),
      }),
      body: { appendChild: () => {} },
      execCommand: () => true,
    };
    vi.stubGlobal('document', document);

    await expect(copyText('x')).resolves.toBe(false);
    expect(removed).toHaveLength(1);
  });
});
