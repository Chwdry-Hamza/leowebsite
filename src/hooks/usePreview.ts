"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useInlineEditRuntime } from "@/components/InlineEditRuntime";

/**
 * Shared hooks for spay-cms live preview wiring.
 *
 * `useEditablePreview` is the primary entry point: feed it the initial
 * server-resolved content and a `resolve(raw)` function that deep-merges saved
 * overrides over your defaults; it returns `content` that re-renders when the
 * CMS pushes updates, plus a `rootRef` you attach to the editable subtree.
 */

function readIsPreview(): boolean {
  return (
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("preview") === "1"
  );
}

/**
 * Full editable-preview wiring for a page body component. Holds the live
 * `content`, listens for the CMS stream + edit-mode toggle with a focus guard
 * (so an incoming echo never clobbers the field being typed in), and mounts
 * the inline-edit runtime. The component spreads `content` into its markup
 * and tags fields with `data-cms-*`.
 */
export function useEditablePreview<T>(
  initialContent: T,
  resolve: (raw: unknown) => T,
): { content: T; rootRef: RefObject<HTMLDivElement | null> } {
  const [isPreview] = useState(readIsPreview);
  const [content, setContent] = useState<T>(initialContent);
  const [editing, setEditing] = useState(false);
  const editingFieldRef = useRef(false);
  const pendingRef = useRef<T | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isPreview) return;
    const onMessage = (e: MessageEvent) => {
      const d = e.data;
      if (!d || typeof d !== "object") return;
      if (d.type === "spay:preview-content") {
        const resolved = resolve(d.sections);
        if (editingFieldRef.current) {
          pendingRef.current = resolved; // apply once the field blurs
        } else {
          setContent(resolved);
        }
      } else if (d.type === "spay:preview-edit-mode") {
        setEditing(!!d.editing);
      }
    };
    window.addEventListener("message", onMessage);
    try {
      window.parent?.postMessage({ type: "spay:preview-ready" }, "*");
    } catch {
      /* not embedded */
    }
    return () => window.removeEventListener("message", onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPreview]);

  const onFieldBlur = useCallback(() => {
    if (pendingRef.current !== null) {
      setContent(pendingRef.current);
      pendingRef.current = null;
    }
  }, []);

  useInlineEditRuntime({
    enabled: isPreview && editing,
    editingFieldRef,
    onFieldBlur,
    contentKey: content,
    root: rootRef.current,
  });

  return { content, rootRef };
}

/** Whether we're in the preview iframe and whether Edit mode is on. */
export function usePreviewEditMode(): { isPreview: boolean; editing: boolean } {
  const [isPreview] = useState(readIsPreview);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!isPreview) return;
    const onMsg = (e: MessageEvent) => {
      if (e.data && typeof e.data === "object" && e.data.type === "spay:preview-edit-mode") {
        setEditing(!!e.data.editing);
      }
    };
    window.addEventListener("message", onMsg);
    try {
      window.parent?.postMessage({ type: "spay:preview-ready" }, "*");
    } catch {
      /* not embedded */
    }
    return () => window.removeEventListener("message", onMsg);
  }, [isPreview]);

  return { isPreview, editing };
}
