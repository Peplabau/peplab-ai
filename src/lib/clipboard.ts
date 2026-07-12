/**
 * Copy text to the clipboard. Prefer Async Clipboard API (HTTPS); fall back to
 * execCommand for HTTP previews, older browsers, or denied permissions.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && globalThis.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to legacy path.
    }
  }

  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('aria-hidden', 'true');
    ta.style.cssText = 'position:fixed;top:-1000px;left:-1000px;width:1px;height:1px;padding:0;border:none;opacity:0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
