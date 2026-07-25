import type { Blockquote, Paragraph, PhrasingContent, Root, Text } from 'mdast';
import { visit } from 'unist-util-visit';

/** Matches the marker line, e.g. `[!WARNING]`, `[!WARNING]+`, or `[!WARNING] Custom title`. */
const CALLOUT_PATTERN = /^\[!([A-Za-z]+)\](?:[+-])?[ \t]*([^\n]*)\n?([\s\S]*)$/;

export const CALLOUT_LABELS: Record<string, string> = {
  note: 'Note',
  tip: 'Tip',
  info: 'Info',
  warning: 'Warning',
  danger: 'Danger',
  success: 'Success',
  question: 'Question',
  example: 'Example',
};

const KNOWN_TYPES = new Set(Object.keys(CALLOUT_LABELS));

function isParagraph(node: unknown): node is Paragraph {
  return !!node && typeof node === 'object' && (node as { type?: string }).type === 'paragraph';
}

function isText(node: unknown): node is Text {
  return !!node && typeof node === 'object' && (node as { type?: string }).type === 'text';
}

/**
 * Remark plugin implementing Obsidian-style Markdown callouts:
 *
 * ```markdown
 * > [!NOTE]
 * > This is a note.
 *
 * > [!WARNING] Custom title
 * > This is an important warning.
 * ```
 *
 * A blockquote whose first line matches the `[!TYPE]` marker is converted
 * into `<div class="callout callout-<type>" data-callout="<type>" role="note">`
 * with an accessible title element. Blockquotes that don't match (i.e.
 * ordinary quotations) are left completely untouched.
 */
export function remarkCallouts() {
  return (tree: Root) => {
    visit(tree, 'blockquote', (node: Blockquote) => {
      const firstChild = node.children[0];
      if (!isParagraph(firstChild)) return;

      const firstText = firstChild.children[0];
      if (!isText(firstText)) return;

      const match = CALLOUT_PATTERN.exec(firstText.value);
      if (!match) return;

      const rawType = match[1]?.toLowerCase() ?? '';
      if (!KNOWN_TYPES.has(rawType)) return;

      const inlineTitle = (match[2] ?? '').trim();
      const remainder = (match[3] ?? '').replace(/^\n/, '');
      const title = inlineTitle || CALLOUT_LABELS[rawType];

      // Strip the `[!TYPE] ...` marker from the first paragraph, keeping
      // any remaining inline content that followed it on the same line.
      if (remainder) {
        firstText.value = remainder;
      } else {
        firstChild.children.shift();
        if (firstChild.children.length === 0) {
          node.children.shift();
        }
      }

      const titleNode: Paragraph = {
        type: 'paragraph',
        data: {
          hName: 'p',
          hProperties: { className: ['callout-title'] },
        },
        children: [{ type: 'text', value: title ?? '' }] as PhrasingContent[],
      };

      node.children.unshift(titleNode);

      node.data = {
        ...node.data,
        hName: 'div',
        hProperties: {
          className: ['callout', `callout-${rawType}`],
          'data-callout': rawType,
          role: 'note',
        },
      };
    });
  };
}
