type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';
const root = document.documentElement;

function readStoredPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return 'system';
  }
}

function writeStoredPreference(pref: ThemePreference): void {
  try {
    if (pref === 'system') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, pref);
    }
  } catch {
    // localStorage unavailable (e.g. private browsing) — theme still applies
    // for this page load, it just won't persist across visits.
  }
}

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function updateToggleLabel(pref: ThemePreference): void {
  const label = document.querySelector<HTMLElement>('[data-theme-toggle-label]');
  if (!label) return;
  label.textContent =
    pref === 'system' ? `Theme: system default (currently ${getSystemTheme()})` : `Theme: ${pref}`;
}

function applyPreference(pref: ThemePreference): void {
  root.dataset.themePreference = pref;
  if (pref === 'system') {
    delete root.dataset.theme;
  } else {
    root.dataset.theme = pref;
  }
  updateToggleLabel(pref);
}

function nextPreference(current: ThemePreference): ThemePreference {
  if (current === 'system') return 'light';
  if (current === 'light') return 'dark';
  return 'system';
}

function init(): void {
  applyPreference(readStoredPreference());

  const toggle = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  toggle?.addEventListener('click', () => {
    const current = (root.dataset.themePreference as ThemePreference | undefined) ?? 'system';
    const next = nextPreference(current);
    writeStoredPreference(next);
    applyPreference(next);
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (root.dataset.themePreference === 'system') {
      updateToggleLabel('system');
    }
  });
}

init();

// Makes this file an ES module (rather than a global script) so its
// top-level declarations don't collide with same-named ones in other
// standalone script modules during type-checking.
export {};
