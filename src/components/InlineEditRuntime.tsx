"use client";

import { useEffect, type MutableRefObject } from "react";

/**
 * Client-side inline-editing runtime for the spay-cms live preview.
 *
 * It decorates DOM nodes that the section components tagged with `data-cms-*`
 * attributes so an editor can change text/images/links directly in the preview
 * iframe. It is intentionally framework-free (imperative DOM) so it can coexist
 * with React-rendered text without fighting reconciliation:
 *
 *  - It NEVER writes `textContent` — React renders text from `content`; the
 *    runtime only toggles editability, hover outlines, overlays, and listeners.
 *  - Text commits ONLY on blur / Enter (never per keystroke), and the parent
 *    (HomeSections) holds incoming content while a field is focused, so the
 *    echo of a committed edit can't clobber the field you're in.
 *
 * Tag contract (set by the homepage section components):
 *  - `data-cms-field="hero.subtitle"`            → editable text
 *  - `data-cms-field` + `data-cms-multiline`     → editable text where Enter
 *                                                   inserts "\n" (titles)
 *  - `data-cms-field` + `data-cms-type="image"`  → image wrapper (Change button)
 *  - `data-cms-href="hero.ctaUrl"`               → link whose URL is editable
 *
 * Messages posted to the parent (CMS):
 *  - { type: 'spay:preview-edit', path, value }       (text / link URL)
 *  - { type: 'spay:preview-pick-image', path }        (open the media picker)
 */
export function useInlineEditRuntime(opts: {
  enabled: boolean;
  /** Set true while a field is focused; read by HomeSections' content guard. */
  editingFieldRef: MutableRefObject<boolean>;
  /** Called on focusout so HomeSections can flush any held content. */
  onFieldBlur: () => void;
  /** Re-run decoration when content changes (React replaced the text nodes). */
  contentKey: unknown;
  /**
   * Limit decoration to this element's subtree. Used by inner pages so the
   * shared footer/chrome — which belongs to the homepage's content — isn't
   * made editable there. Defaults to the document.
   */
  root?: HTMLElement | null;
}) {
  const { enabled, editingFieldRef, onFieldBlur, contentKey, root } = opts;

  useEffect(() => {
    if (!enabled) return;

    const post = (msg: Record<string, unknown>) => {
      try {
        window.parent?.postMessage(msg, "*");
      } catch {
        /* not embedded */
      }
    };

    const cleanups: Array<() => void> = [];
    const scope: ParentNode = root ?? document;

    // ── Injected, self-cleaning styles ────────────────────────────────
    document.getElementById("cms-inline-edit-style")?.remove();
    {
      const style = document.createElement("style");
      style.id = "cms-inline-edit-style";
      style.textContent = `
        [style*="marquee"], .animate-marquee { animation-play-state: paused !important; }
        [data-cms-field]:not([data-cms-type="image"]):hover {
          outline: 1px dashed rgba(111,227,255,0.7);
          outline-offset: 2px;
          cursor: text;
        }
        [data-cms-field][contenteditable]:focus {
          outline: 2px solid #6FE3FF;
          outline-offset: 2px;
        }
        [data-cms-type="image"].cms-img-edit { position: relative; }
        [data-cms-type="image"].cms-img-edit:hover { outline: 2px solid #6FE3FF; outline-offset: 2px; }
        .cms-overlay-btn {
          position: absolute; z-index: 2147483000;
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 14px; font: 600 14px/1 system-ui, sans-serif;
          color: #04070F; background: #6FE3FF; border: 0; border-radius: 8px;
          cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,0.45);
          white-space: nowrap;
        }
        .cms-img-edit .cms-overlay-btn { top: 10px; right: 10px; }
        .cms-url-btn { top: 0; left: 0; transform: translateY(-140%); }
        .cms-url-btn-below { top: 100%; transform: translateY(8px); }
        .cms-img-edit .cms-overlay-btn,
        [data-cms-href] .cms-overlay-btn { opacity: 0; transition: opacity 0.12s; }
        .cms-img-edit:hover .cms-overlay-btn,
        [data-cms-href]:hover .cms-overlay-btn { opacity: 1; }
        .cms-url-pop {
          position: fixed; z-index: 2147483001;
          display: flex; gap: 10px; padding: 14px;
          max-width: calc(100vw - 24px);
          background: #0e1626; border: 1px solid rgba(111,227,255,0.35);
          border-radius: 12px; box-shadow: 0 14px 40px rgba(0,0,0,0.6);
        }
        .cms-url-pop input {
          width: min(440px, 60vw); padding: 12px 14px; font: 16px/1.3 system-ui, sans-serif;
          color: #e8ecf5; background: #060b16;
          border: 1px solid rgba(255,255,255,0.16); border-radius: 9px; outline: none;
        }
        .cms-url-pop input:focus { border-color: #6FE3FF; }
        .cms-url-pop button {
          padding: 12px 18px; font: 600 15px/1 system-ui, sans-serif;
          border: 0; border-radius: 9px; cursor: pointer;
        }
        .cms-url-pop .save { color: #04070F; background: #6FE3FF; }
        .cms-url-pop .cancel { color: #c3c9d6; background: rgba(255,255,255,0.08); }
      `;
      document.head.appendChild(style);
      cleanups.push(() => style.remove());
    }

    // ── Text fields ───────────────────────────────────────────────────
    const textEls = Array.from(
      scope.querySelectorAll<HTMLElement>(
        '[data-cms-field]:not([data-cms-type="image"])',
      ),
    );

    for (const el of textEls) {
      const path = el.getAttribute("data-cms-field")!;
      const multiline = el.hasAttribute("data-cms-multiline");
      const isRaw = el.hasAttribute("data-cms-raw");

      el.setAttribute("contenteditable", "plaintext-only");
      if (el.contentEditable !== "plaintext-only") {
        el.setAttribute("contenteditable", "true");
      }
      el.setAttribute("spellcheck", "false");

      let valueAtFocus = "";
      const onFocus = () => {
        editingFieldRef.current = true;
        if (isRaw) el.textContent = el.getAttribute("data-cms-raw") ?? "";
        valueAtFocus = readEditableText(el);
      };
      const onBlur = () => {
        const value = readEditableText(el);
        if (value !== valueAtFocus) {
          post({ type: "spay:preview-edit", path, value });
        }
        editingFieldRef.current = false;
        onFieldBlur();
      };
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          if (multiline && !e.shiftKey) {
            e.preventDefault();
            document.execCommand("insertText", false, "\n");
          } else if (!multiline) {
            e.preventDefault();
            el.blur();
          }
        } else if (e.key === "Escape") {
          el.blur();
        }
      };

      el.addEventListener("focus", onFocus);
      el.addEventListener("blur", onBlur);
      el.addEventListener("keydown", onKeyDown);
      cleanups.push(() => {
        el.removeAttribute("contenteditable");
        el.removeAttribute("spellcheck");
        el.removeEventListener("focus", onFocus);
        el.removeEventListener("blur", onBlur);
        el.removeEventListener("keydown", onKeyDown);
      });
    }

    // ── Image fields ──────────────────────────────────────────────────
    const imgEls = Array.from(
      scope.querySelectorAll<HTMLElement>('[data-cms-type="image"][data-cms-field]'),
    );
    for (const el of imgEls) {
      const path = el.getAttribute("data-cms-field")!;
      el.classList.add("cms-img-edit");
      const btn = document.createElement("button");
      btn.className = "cms-overlay-btn";
      btn.setAttribute("data-cms-overlay", "");
      btn.type = "button";
      btn.textContent = "Change image";
      const onClick = () => post({ type: "spay:preview-pick-image", path });
      btn.addEventListener("click", onClick);
      el.appendChild(btn);
      cleanups.push(() => {
        btn.removeEventListener("click", onClick);
        btn.remove();
        el.classList.remove("cms-img-edit");
      });
    }

    // ── Link URL editors ──────────────────────────────────────────────
    const hrefEls = Array.from(
      scope.querySelectorAll<HTMLElement>("[data-cms-href]"),
    );
    for (const el of hrefEls) {
      const path = el.getAttribute("data-cms-href")!;
      const prevPos = el.style.position;
      if (getComputedStyle(el).position === "static") el.style.position = "relative";
      const btn = document.createElement("button");
      btn.className = "cms-overlay-btn cms-url-btn";
      if (el.hasAttribute("data-cms-href-below")) btn.classList.add("cms-url-btn-below");
      btn.setAttribute("data-cms-overlay", "");
      btn.contentEditable = "false";
      btn.type = "button";
      btn.textContent = "Edit URL";
      const onClick = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        openUrlPopover(btn, el.getAttribute("href") ?? "", (val) =>
          post({ type: "spay:preview-edit", path, value: val }),
        );
      };
      btn.addEventListener("click", onClick);
      el.appendChild(btn);
      cleanups.push(() => {
        btn.removeEventListener("click", onClick);
        btn.remove();
        el.style.position = prevPos;
      });
    }

    // ── Suppress navigation while editing ─────────────────────────────
    const onCaptureClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("[data-cms-overlay]")) return;
      if (t.closest("[data-cms-field][contenteditable]")) return;
      if (t.closest("a") || t.closest("[data-cms-flip]")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("click", onCaptureClick, true);
    cleanups.push(() => document.removeEventListener("click", onCaptureClick, true));

    return () => {
      cleanups.forEach((fn) => fn());
      editingFieldRef.current = false;
    };
  }, [enabled, contentKey, editingFieldRef, onFieldBlur, root]);
}

/** Element's own text, excluding injected overlay controls (e.g. Edit URL btn). */
function readEditableText(el: HTMLElement): string {
  let out = "";
  el.childNodes.forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE) {
      out += n.textContent ?? "";
    } else if (
      n.nodeType === Node.ELEMENT_NODE &&
      !(n as HTMLElement).hasAttribute("data-cms-overlay")
    ) {
      out += (n as HTMLElement).textContent ?? "";
    }
  });
  return out;
}

/** Minimal floating URL editor anchored above the clicked control. */
function openUrlPopover(
  anchor: HTMLElement,
  current: string,
  onSave: (value: string) => void,
) {
  document.querySelectorAll(".cms-url-pop").forEach((n) => n.remove());

  const rect = anchor.getBoundingClientRect();
  const below = anchor.classList.contains("cms-url-btn-below");
  const pop = document.createElement("div");
  pop.className = "cms-url-pop";
  pop.setAttribute("data-cms-overlay", "");

  const input = document.createElement("input");
  input.value = current;
  input.placeholder = "https:// or /path";

  const save = document.createElement("button");
  save.className = "save";
  save.textContent = "Save";

  const cancel = document.createElement("button");
  cancel.className = "cancel";
  cancel.textContent = "Cancel";

  pop.append(input, save, cancel);
  document.body.appendChild(pop);

  const margin = 12;
  const pw = pop.offsetWidth;
  const ph = pop.offsetHeight;
  const left = Math.max(margin, Math.min(rect.left, window.innerWidth - pw - margin));
  const rawTop = below ? rect.bottom + 8 : rect.top - ph - 8;
  const top = Math.max(margin, Math.min(rawTop, window.innerHeight - ph - margin));
  pop.style.left = `${left}px`;
  pop.style.top = `${top}px`;

  input.focus();
  input.select();

  const close = () => {
    pop.remove();
    document.removeEventListener("mousedown", onOutside, true);
  };
  const commit = () => {
    onSave(input.value.trim());
    close();
  };
  const onOutside = (e: MouseEvent) => {
    if (!pop.contains(e.target as Node)) close();
  };

  save.addEventListener("click", commit);
  cancel.addEventListener("click", close);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") close();
  });
  setTimeout(() => document.addEventListener("mousedown", onOutside, true), 0);
}
