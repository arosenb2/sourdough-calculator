import { describe, it, expect } from 'vitest';
import {
  COLOR_THEMES,
  DEFAULT_COLOR_THEME,
  normalizeColorTheme,
  readStoredColorTheme,
  saveColorTheme,
} from './colorTheme';

const fakeStorage = (initial = {}) => {
  const data = { ...initial };
  return { getItem: (k) => data[k] ?? null, setItem: (k, v) => { data[k] = v; }, data };
};

describe('colorTheme', () => {
  it('offers classic, futuristic and 80s, with classic as the default', () => {
    expect(COLOR_THEMES.map((t) => t.id)).toEqual(['classic', 'futuristic', 'eighties']);
    expect(DEFAULT_COLOR_THEME).toBe('classic');
  });

  it('only accepts known themes', () => {
    expect(normalizeColorTheme('futuristic')).toBe('futuristic');
    expect(normalizeColorTheme('eighties')).toBe('eighties');
    expect(normalizeColorTheme('neon-pink')).toBe('classic');
    expect(normalizeColorTheme(null)).toBe('classic');
  });

  it('reads the saved theme, ignoring junk', () => {
    expect(readStoredColorTheme(fakeStorage({ colorTheme: 'futuristic' }))).toBe('futuristic');
    expect(readStoredColorTheme(fakeStorage({ colorTheme: 'bogus' }))).toBe('classic');
    expect(readStoredColorTheme(fakeStorage())).toBe('classic');
  });

  it('falls back to classic when storage is blocked', () => {
    const blocked = { getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('denied'); } };
    expect(readStoredColorTheme(blocked)).toBe('classic');
    expect(() => saveColorTheme('futuristic', blocked)).not.toThrow();
  });

  it('saves the chosen theme', () => {
    const storage = fakeStorage();
    saveColorTheme('futuristic', storage);
    expect(storage.data.colorTheme).toBe('futuristic');
    saveColorTheme('nonsense', storage);
    expect(storage.data.colorTheme).toBe('classic');
  });
});
