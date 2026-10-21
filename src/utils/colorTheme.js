// Colour themes are separate from light/dark: each one defines both.
export const COLOR_THEMES = [
  { id: 'classic', label: 'Classic' },
  { id: 'futuristic', label: 'Futuristic' },
  { id: 'eighties', label: '80s' },
];

export const DEFAULT_COLOR_THEME = 'classic';
export const COLOR_THEME_KEY = 'colorTheme';

export const normalizeColorTheme = (value) =>
  COLOR_THEMES.some((theme) => theme.id === value) ? value : DEFAULT_COLOR_THEME;

export const readStoredColorTheme = (storage = globalThis.localStorage) => {
  try {
    return normalizeColorTheme(storage?.getItem(COLOR_THEME_KEY));
  } catch {
    return DEFAULT_COLOR_THEME;
  }
};

export const saveColorTheme = (id, storage = globalThis.localStorage) => {
  try {
    storage?.setItem(COLOR_THEME_KEY, normalizeColorTheme(id));
  } catch {
    // private mode or blocked storage: the theme just won't be remembered
  }
};
