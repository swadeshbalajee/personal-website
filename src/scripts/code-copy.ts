/**
 * Wraps every Shiki-rendered code block in a `.code-block` container with a
 * copy button (cloned from the shared <template>) and, when the fence
 * supplied `title="..."`, a file-title label bar. Runs once per page load
 * against however many code blocks exist — one script, not one component
 * instance per block.
 */

function announce(button: HTMLButtonElement, message: string, state: 'copied' | 'error'): void {
  const label = button.querySelector<HTMLElement>('[data-copy-label]');
  const status = button.querySelector<HTMLElement>('[data-copy-status]');
  const originalLabel = label?.dataset.originalText ?? label?.textContent ?? 'Copy';
  if (label && !label.dataset.originalText) label.dataset.originalText = originalLabel;

  if (label) label.textContent = message;
  if (status) status.textContent = message;
  button.dataset.state = state;

  window.setTimeout(() => {
    if (label) label.textContent = originalLabel;
    if (status) status.textContent = '';
    delete button.dataset.state;
  }, 2000);
}

async function copyCode(pre: HTMLElement, button: HTMLButtonElement): Promise<void> {
  const code = pre.querySelector('code')?.textContent ?? '';
  try {
    await navigator.clipboard.writeText(code);
    announce(button, 'Copied!', 'copied');
  } catch {
    announce(button, 'Copy failed', 'error');
  }
}

function enhanceCodeBlock(pre: HTMLPreElement, template: HTMLTemplateElement): void {
  const wrapper = document.createElement('div');
  wrapper.className = 'code-block';

  const title = pre.dataset.title;
  const lang = pre.dataset.lang;
  if (title) {
    wrapper.dataset.hasTitle = 'true';
  }

  pre.replaceWith(wrapper);

  if (title) {
    const titleBar = document.createElement('div');
    titleBar.className = 'code-block__title';
    titleBar.textContent = title;
    if (lang) {
      const langTag = document.createElement('span');
      langTag.textContent = lang;
      titleBar.appendChild(langTag);
    }
    wrapper.appendChild(titleBar);
  } else if (lang) {
    const langBadge = document.createElement('span');
    langBadge.className = 'code-block__lang';
    langBadge.textContent = lang;
    wrapper.appendChild(langBadge);
  }

  wrapper.appendChild(pre);

  const fragment = template.content.cloneNode(true) as DocumentFragment;
  const button = fragment.querySelector<HTMLButtonElement>('[data-code-copy-button]');
  wrapper.appendChild(fragment);

  button?.addEventListener('click', () => void copyCode(pre, button));
}

function init(): void {
  const template = document.querySelector<HTMLTemplateElement>('[data-code-copy-template]');
  if (!template) return;

  const blocks = document.querySelectorAll<HTMLPreElement>('.astro-code');
  blocks.forEach((pre) => enhanceCodeBlock(pre, template));
}

init();

// Makes this file an ES module (rather than a global script) so its
// top-level declarations don't collide with same-named ones in other
// standalone script modules during type-checking.
export {};
