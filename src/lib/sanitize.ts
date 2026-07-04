/**
 * Security helpers for injecting CMS-authored content into the public site.
 */

/**
 * Serialize a value for safe injection inside a `<script type="application/ld+json">`
 * tag. `JSON.stringify` does NOT escape `<`, so a string value containing
 * `</script>` could break out of the script element and inject markup. Escaping
 * `<` and `>` to their `\uXXXX` form keeps the JSON valid and inert. Accepts an
 * object (stringified) or a raw JSON string (e.g. custom JSON-LD from an editor).
 */
export function serializeJsonLd(data: unknown): string {
  const json = typeof data === 'string' ? data : JSON.stringify(data);
  return (json ?? '').replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
}

/**
 * Allow only safe URL schemes for links built from CMS content. Blocks
 * `javascript:` / `data:` / `vbscript:` (which execute on click → XSS) while
 * keeping relative paths, anchors, query strings, protocol-relative URLs, and
 * the explicit http(s)/mailto/tel schemes. Unknown/unsafe input collapses to `#`.
 */
export function safeHref(url: string | undefined | null): string {
  const u = (url ?? '').trim();
  if (!u) return '#';
  if (/^[/#?]/.test(u) || u.startsWith('//')) return u; // relative / anchor / protocol-relative
  if (/^(https?:|mailto:|tel:)/i.test(u)) return u; // explicit safe schemes
  return '#'; // javascript:, data:, etc.
}
