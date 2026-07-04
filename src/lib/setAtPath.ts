/**
 * Immutable deep set by dotted path.
 *
 * `setAtPath(obj, "hero.titleParts.1.text", "MONEY ")` returns a NEW object with
 * that leaf replaced and every container along the way shallow-copied (so React
 * sees a changed reference). Numeric path segments address array indices.
 *
 * Used by the inline preview editor: an edit committed in the iframe is applied
 * to the resolved content object by path, then streamed/saved.
 */
export function setAtPath<T>(obj: T, path: string, value: unknown): T {
  const keys = path.split('.');

  const clone = (node: unknown, depth: number): unknown => {
    const key = keys[depth];
    const isLast = depth === keys.length - 1;

    // Shallow-copy the current container (array stays array, object stays object).
    const next: Record<string, unknown> = Array.isArray(node)
      ? (node.slice() as unknown as Record<string, unknown>)
      : { ...((node as Record<string, unknown>) ?? {}) };

    if (isLast) {
      next[key] = value;
      return next;
    }

    // Descend; create a missing container shaped by the NEXT key (numeric → array).
    const child = next[key];
    const childSeed = child ?? (/^\d+$/.test(keys[depth + 1]) ? [] : {});
    next[key] = clone(childSeed, depth + 1);
    return next;
  };

  return clone(obj, 0) as T;
}
