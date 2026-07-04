import React from 'react';

type Mark = { type: string; attrs?: Record<string, any> };
type Node = {
  type: string;
  attrs?: Record<string, any>;
  content?: Node[];
  marks?: Mark[];
  text?: string;
};

/**
 * Wraps `children` with each mark in order. Each wrapper is the single child
 * of the next, so they are NOT part of an array — no `key` prop needed
 * (assigning one made sibling text nodes collide on `key=0`).
 */
function applyMarks(children: React.ReactNode, marks?: Mark[]): React.ReactNode {
  if (!marks?.length) return children;
  return marks.reduce<React.ReactNode>((acc, mark) => {
    switch (mark.type) {
      case 'bold':   return <strong>{acc}</strong>;
      case 'italic': return <em>{acc}</em>;
      case 'link': {
        const { href, target, rel } = mark.attrs ?? {};
        const isExternal = href && /^https?:\/\//i.test(href);
        return (
          <a
            href={href}
            target={target ?? (isExternal ? '_blank' : undefined)}
            rel={isExternal ? (rel ?? 'noopener noreferrer') : rel}
            className="text-cyan-300 underline-offset-[3px] underline hover:text-cyan-200"
          >
            {acc}
          </a>
        );
      }
      default: return acc;
    }
  }, children);
}

function renderNode(node: Node, key: React.Key): React.ReactNode {
  if (!node) return null;

  switch (node.type) {
    case 'doc':
      return <React.Fragment key={key}>{node.content?.map((n, i) => renderNode(n, i))}</React.Fragment>;

    case 'paragraph':
      return (
        <p key={key} className="my-4 leading-relaxed text-fg-2">
          {node.content?.map((n, i) => renderNode(n, i))}
        </p>
      );

    case 'heading': {
      const level = Math.min(Math.max(node.attrs?.level ?? 2, 1), 6) as 1 | 2 | 3 | 4 | 5 | 6;
      const Tag = `h${level}` as React.ElementType;
      const cls =
        level === 1 ? 'font-display font-bold text-3xl md:text-4xl tracking-[-0.025em] text-cyan-300 mt-12 mb-4' :
        level === 2 ? 'font-display font-bold text-2xl md:text-3xl tracking-[-0.02em] text-fg-1 mt-10 mb-3' :
        level === 3 ? 'font-display font-semibold text-xl md:text-2xl text-fg-1 mt-8 mb-2' :
                      'font-display font-semibold text-lg text-fg-1 mt-6 mb-2';
      return React.createElement(
        Tag,
        { key, className: cls },
        node.content?.map((n, i) => renderNode(n, i))
      );
    }

    case 'bulletList':
      return <ul key={key} className="my-4 ml-6 list-disc space-y-2 marker:text-cyan-300">{node.content?.map((n, i) => renderNode(n, i))}</ul>;
    case 'orderedList':
      return <ol key={key} className="my-4 ml-6 list-decimal space-y-2 marker:text-cyan-300 marker:font-mono">{node.content?.map((n, i) => renderNode(n, i))}</ol>;
    case 'listItem':
      return <li key={key} className="leading-relaxed text-fg-2">{node.content?.map((n, i) => renderNode(n, i))}</li>;

    case 'hardBreak':
      return <br key={key} />;

    case 'table':
      return (
        <div key={key} className="my-6 overflow-x-auto">
          <table className="w-full border-collapse rounded-leo-md overflow-hidden border border-line">
            <tbody>{node.content?.map((n, i) => renderNode(n, i))}</tbody>
          </table>
        </div>
      );
    case 'tableRow':
      return <tr key={key} className="border-b border-line last:border-b-0">{node.content?.map((n, i) => renderNode(n, i))}</tr>;
    case 'tableHeader': {
      const colspan = node.attrs?.colspan;
      const rowspan = node.attrs?.rowspan;
      return (
        <th
          key={key}
          colSpan={colspan}
          rowSpan={rowspan}
          className="border border-line bg-cyan-300/[0.04] text-left px-3 py-2 text-sm font-semibold text-fg-1"
        >
          {node.content?.map((n, i) => renderNode(n, i))}
        </th>
      );
    }
    case 'tableCell': {
      const colspan = node.attrs?.colspan;
      const rowspan = node.attrs?.rowspan;
      return (
        <td
          key={key}
          colSpan={colspan}
          rowSpan={rowspan}
          className="border border-line px-3 py-2 text-sm text-fg-2 align-top"
        >
          {node.content?.map((n, i) => renderNode(n, i))}
        </td>
      );
    }

    case 'text':
      // Wrap with Fragment so the parent-supplied key sticks to the
      // OUTERMOST element among its siblings (not to a mark-wrapper).
      return <React.Fragment key={key}>{applyMarks(node.text, node.marks)}</React.Fragment>;

    default:
      // Unknown node — fall back to rendering children
      return node.content
        ? <React.Fragment key={key}>{node.content.map((n, i) => renderNode(n, i))}</React.Fragment>
        : null;
  }
}

export function TiptapRenderer({ doc }: { doc: any }) {
  if (!doc || typeof doc !== 'object') return null;
  return <>{renderNode(doc, 'root')}</>;
}
