/**
 * Wires a search root (either the header SearchDialog or the standalone
 * /search page — both share the same markup contract) up to Pagefind.
 *
 * Pagefind's index and runtime (`/pagefind/pagefind.js`) are only produced
 * by `npm run build` (see package.json's `build` script), so this module
 * treats a failed dynamic import as an expected "unavailable in dev/preview
 * without a build" state rather than an error to surface loudly.
 */

interface PagefindResultData {
  url: string;
  excerpt: string;
  meta: { title?: string };
}

interface PagefindSearchResult {
  data: () => Promise<PagefindResultData>;
}

interface PagefindApi {
  init: () => Promise<void>;
  search: (query: string) => Promise<{ results: PagefindSearchResult[] }>;
}

// Pagefind's runtime is generated into dist/pagefind/ by `pagefind --site
// dist` (see package.json's build script) — it only exists as a static file
// served at runtime, never as a real module on disk. A plain `import()`
// here — even with `/* @vite-ignore */` — still gets wrapped by Vite's
// dynamic-import preload helper at build time, which throws
// `__VITE_PRELOAD__ is not defined` for a path Vite never bundled. Building
// the specifier through `Function` hides the import from Vite's static
// analysis entirely, avoiding that helper.
const importPagefind = new Function('specifier', 'return import(specifier)') as (
  specifier: string,
) => Promise<PagefindApi>;

let pagefindPromise: Promise<PagefindApi> | null = null;

function loadPagefind(): Promise<PagefindApi> {
  pagefindPromise ??= importPagefind('/pagefind/pagefind.js').then(async (mod) => {
    await mod.init();
    return mod;
  });
  return pagefindPromise;
}

function renderResults(list: HTMLElement, items: PagefindResultData[]): void {
  list.replaceChildren();

  for (const item of items) {
    const li = document.createElement('li');
    li.className = 'search-result';

    const link = document.createElement('a');
    link.href = item.url;
    link.className = 'search-result__link';

    const title = document.createElement('span');
    title.className = 'search-result__title';
    title.textContent = item.meta.title || item.url;

    const url = document.createElement('span');
    url.className = 'search-result__url';
    url.textContent = item.url;

    const excerpt = document.createElement('span');
    excerpt.className = 'search-result__excerpt';
    // Pagefind's excerpt is a small, trusted HTML fragment containing only
    // <mark> highlights around the matched terms.
    excerpt.innerHTML = item.excerpt;

    link.append(title, url, excerpt);
    li.appendChild(link);
    list.appendChild(li);
  }
}

function initSearchRoot(root: HTMLElement): void {
  const input = root.querySelector<HTMLInputElement>('[data-search-input]');
  const resultsList = root.querySelector<HTMLElement>('[data-search-results]');
  const status = root.querySelector<HTMLElement>('[data-search-status]');
  if (!input || !resultsList || !status) return;

  let debounceHandle: number | undefined;

  async function runSearch(query: string): Promise<void> {
    const trimmed = query.trim();
    if (!trimmed) {
      resultsList!.replaceChildren();
      status!.textContent = '';
      resultsList!.dataset.state = 'idle';
      return;
    }

    status!.textContent = 'Searching…';
    resultsList!.dataset.state = 'loading';

    try {
      const pagefind = await loadPagefind();
      const search = await pagefind.search(trimmed);
      const items = await Promise.all(search.results.slice(0, 20).map((result) => result.data()));

      if (items.length === 0) {
        resultsList!.replaceChildren();
        resultsList!.dataset.state = 'empty';
        status!.textContent = `No results for "${trimmed}".`;
        return;
      }

      resultsList!.dataset.state = 'results';
      renderResults(resultsList!, items);
      status!.textContent = `${items.length} result${items.length === 1 ? '' : 's'} for "${trimmed}".`;
    } catch {
      resultsList!.replaceChildren();
      resultsList!.dataset.state = 'error';
      status!.textContent =
        'Search is unavailable right now. It only works in a production build (npm run build) served with npm run preview.';
    }
  }

  input.addEventListener('input', () => {
    window.clearTimeout(debounceHandle);
    const query = input.value;
    debounceHandle = window.setTimeout(() => void runSearch(query), 200);
  });

  input.addEventListener('keydown', (event) => {
    const items = Array.from(resultsList!.querySelectorAll<HTMLAnchorElement>('a'));
    if (items.length === 0) return;

    const currentIndex = items.findIndex((item) => item === document.activeElement);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = items[Math.min(currentIndex + 1, items.length - 1)] ?? items[0];
      next?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (currentIndex <= 0) {
        input.focus();
      } else {
        items[currentIndex - 1]?.focus();
      }
    }
  });

  const initialQuery = new URLSearchParams(window.location.search).get('q');
  if (initialQuery) {
    input.value = initialQuery;
    void runSearch(initialQuery);
  }
}

document.querySelectorAll<HTMLElement>('[data-search-root]').forEach(initSearchRoot);

// Makes this file an ES module (rather than a global script) so its
// top-level declarations don't collide with same-named ones in other
// standalone script modules during type-checking.
export {};
