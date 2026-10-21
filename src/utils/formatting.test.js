import { describe, it, expect } from 'vitest';
import { formatWeight, formatPercentage, defaultRecipeName } from './formatting';

describe('formatWeight', () => {
  it('formats integer weights with thousands separator', () => {
    expect(formatWeight(1000)).toBe('1,000g');
    expect(formatWeight(10000)).toBe('10,000g');
  });

  it('formats small weights without separator', () => {
    expect(formatWeight(5)).toBe('5g');
    expect(formatWeight(999)).toBe('999g');
  });

  it('formats decimal weights', () => {
    expect(formatWeight(1000.5)).toBe('1,000.5g');
  });
});

describe('formatPercentage', () => {
  it('formats integer percentages', () => {
    expect(formatPercentage(75)).toBe('75');
    expect(formatPercentage(100)).toBe('100');
  });
});

describe('formatPercentage (decimals and bad input)', () => {
  it('keeps one decimal and drops a trailing .0', () => {
    expect(formatPercentage(87.5)).toBe('87.5');
    expect(formatPercentage(33.33)).toBe('33.3');
    expect(formatPercentage(50.04)).toBe('50');
  });

  it('accepts numeric strings and falls back to 0 for junk', () => {
    expect(formatPercentage('75')).toBe('75');
    expect(formatPercentage('abc')).toBe('0');
  });
});

describe('defaultRecipeName', () => {
  it('names a recipe by hydration and bread type, without the dough weight', () => {
    expect(defaultRecipeName({ hydration: 75, breadType: 'traditional' })).toBe('75% Hydration Sourdough');
    expect(defaultRecipeName({ hydration: 88, breadType: 'rye' })).toBe('88% Hydration Rye');
  });
});
