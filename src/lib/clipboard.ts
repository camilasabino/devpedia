/**
 * Copies text to the clipboard, resolving to whether it worked.
 *
 * `navigator.clipboard` is absent in insecure contexts and older Safari, and can
 * reject even where it exists, so the hidden-textarea path stays as the fallback.
 */
export async function copyText(text: string): Promise<boolean> {
  const clipboard = navigator.clipboard;
  if (clipboard?.writeText) {
    try {
      await clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the legacy path.
    }
  }
  return copyWithExecCommand(text);
}

function copyWithExecCommand(text: string): boolean {
  let textarea: HTMLTextAreaElement | undefined;
  try {
    textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    // Off-screen but still focusable: `display: none` would make `select()` a no-op.
    textarea.style.position = 'fixed';
    textarea.style.top = '-1000px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    // execCommand is deprecated with no replacement for this exact fallback case
    // (insecure contexts / older Safari without navigator.clipboard).
    return document.execCommand('copy'); // NOSONAR
  } catch {
    return false;
  } finally {
    textarea?.remove();
  }
}
