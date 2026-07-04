/**
 * Resolve the `target` + `rel` attributes for a CMS-driven URL field.
 *
 * Rules (matches the LinkPickerModal's "External links open in a new tab
 * automatically" UX):
 *   - Any `http(s)://...` URL → new tab (force `_blank`)
 *   - Otherwise honour the editor's per-link `newTab` flag
 *
 * Returns `{ target: undefined, rel: undefined }` for same-tab links so we
 * don't sprinkle dead attributes through the rendered HTML.
 */
export type LinkTarget = {
  target: '_blank' | undefined;
  rel: 'noopener noreferrer' | undefined;
};

const EXTERNAL_RE = /^https?:\/\//i;

export function linkTarget(
  url: string | null | undefined,
  newTab?: boolean | null,
): LinkTarget {
  const trimmed = (url ?? '').trim();
  const isExternal = EXTERNAL_RE.test(trimmed);
  const opensInNewTab = isExternal || newTab === true;
  return opensInNewTab
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : { target: undefined, rel: undefined };
}
