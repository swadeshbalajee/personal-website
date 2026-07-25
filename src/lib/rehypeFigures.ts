import type { Element, ElementContent, Root } from 'hast';
import { visit } from 'unist-util-visit';

function isElement(node: unknown, tagName?: string): node is Element {
  if (!node || typeof node !== 'object') return false;
  const el = node as Element;
  return el.type === 'element' && (!tagName || el.tagName === tagName);
}

/**
 * Wraps a standalone Markdown image — one that is the sole child of its
 * paragraph, i.e. `![alt](src)` on its own line — in a `<figure>`. An
 * optional image title (`![alt](src "caption")`) becomes the `<figcaption>`.
 * Images used inline within running text are left untouched so a block-level
 * `<figure>` never ends up nested inside a `<p>`.
 */
export function rehypeFigures() {
  return (tree: Root) => {
    visit(tree, 'element', (node, index, parent) => {
      if (!isElement(node, 'p') || !parent || index === null || index === undefined) return;
      if (node.children.length !== 1) return;

      const img = node.children[0];
      if (!isElement(img, 'img')) return;

      const properties = img.properties ?? {};
      const title = typeof properties.title === 'string' ? properties.title : undefined;
      if (title) {
        delete properties.title;
      }
      properties.loading ??= 'lazy';
      properties.decoding ??= 'async';
      img.properties = properties;

      const children: ElementContent[] = title
        ? [
            img,
            {
              type: 'element',
              tagName: 'figcaption',
              properties: {},
              children: [{ type: 'text', value: title }],
            },
          ]
        : [img];

      const figure: Element = {
        type: 'element',
        tagName: 'figure',
        properties: { className: ['figure'] },
        children,
      };

      parent.children[index] = figure;
    });
  };
}

/**
 * Wraps every `<table>` in a `.table-wrapper` div so wide tables scroll
 * horizontally on narrow screens instead of breaking the page layout. The
 * wrapper is keyboard-focusable (`tabindex="0"` + `role="region"`) whenever
 * it actually scrolls, so keyboard users can reach and scroll it — a plain
 * `overflow-x: auto` div is otherwise unreachable without a mouse/touch.
 */
export function rehypeWrapTables() {
  return (tree: Root) => {
    visit(tree, 'element', (node, index, parent) => {
      if (!isElement(node, 'table') || !parent || index === null || index === undefined) return;

      const wrapper: Element = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['table-wrapper'],
          tabIndex: 0,
          role: 'region',
          'aria-label': 'Scrollable table',
        },
        children: [node],
      };

      parent.children[index] = wrapper;
    });
  };
}

/**
 * GFM task-list checkboxes (`- [ ] foo`) render as bare, disabled
 * `<input type="checkbox">` elements with no accessible name. Gives each one
 * an aria-label describing its checked state so screen readers announce
 * something meaningful instead of an unlabeled control.
 */
export function rehypeTaskListLabels() {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (!isElement(node, 'input')) return;
      if (node.properties?.type !== 'checkbox') return;

      node.properties['aria-label'] = node.properties.checked ? 'Completed' : 'Not completed';
    });
  };
}
