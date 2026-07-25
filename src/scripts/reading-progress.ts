/** Drives the sticky reading-progress bar based on scroll position within the article body. */

function init(): void {
  const bar = document.querySelector<HTMLElement>('[data-reading-progress]');
  const article = document.querySelector<HTMLElement>('[data-article-body]');
  if (!bar || !article) return;

  let ticking = false;

  function update(): void {
    const rect = article!.getBoundingClientRect();
    const articleTop = rect.top + window.scrollY;
    const articleHeight = article!.offsetHeight - window.innerHeight;
    const scrolled = window.scrollY - articleTop;
    const percent =
      articleHeight > 0 ? Math.min(100, Math.max(0, (scrolled / articleHeight) * 100)) : 0;

    bar!.style.width = `${percent}%`;
    bar!.setAttribute('aria-valuenow', String(Math.round(percent)));
    ticking = false;
  }

  function onScroll(): void {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
}

init();

// Makes this file an ES module (rather than a global script) so its
// top-level declarations don't collide with same-named ones in other
// standalone script modules during type-checking.
export {};
