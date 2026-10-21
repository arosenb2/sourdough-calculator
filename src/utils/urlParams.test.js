import { describe, it, expect } from 'vitest';
import {
  formatFloursForUrl,
  parseFloursFromUrl,
  formatProcessForUrl,
  parseProcessFromUrl,
} from './urlParams';
import { calculateRecipeFromTotalWeight } from './calculations';

// Flours travel as their keys (BF, WW...), never their display names.
describe('formatFloursForUrl', () => {
  it('should format a single flour correctly', () => {
    expect(formatFloursForUrl([{ type: 'BF', percentage: 100 }])).toBe('BF:100');
  });

  it('should format multiple flours correctly', () => {
    const input = [
      { type: 'BF', percentage: 70 },
      { type: 'WW', percentage: 30 },
    ];
    expect(formatFloursForUrl(input)).toBe('BF:70,WW:30');
  });

  it('should handle empty flour array', () => {
    expect(formatFloursForUrl([])).toBe('');
  });

  it('should handle decimal percentages', () => {
    expect(formatFloursForUrl([{ type: 'BF', percentage: 33.3 }])).toBe('BF:33.3');
  });
});

describe('parseFloursFromUrl', () => {
  it('should parse a single flour correctly', () => {
    expect(parseFloursFromUrl('BF:100')).toEqual([{ type: 'BF', percentage: 100 }]);
  });

  it('should parse multiple flours correctly', () => {
    expect(parseFloursFromUrl('BF:70,WW:30')).toEqual([
      { type: 'BF', percentage: 70 },
      { type: 'WW', percentage: 30 },
    ]);
  });

  it('should convert percentage strings to numbers', () => {
    const result = parseFloursFromUrl('BF:33.3');
    expect(typeof result[0].percentage).toBe('number');
    expect(result[0].percentage).toBe(33.3);
  });

  it('should keep the flour key as the type', () => {
    expect(parseFloursFromUrl('WW:100')[0].type).toBe('WW');
  });

  it('should handle empty string input', () => {
    expect(parseFloursFromUrl('')).toEqual([]);
  });

  it('should round-trip with formatFloursForUrl', () => {
    const flours = [
      { type: 'RY', percentage: 90 },
      { type: 'BF', percentage: 10 },
    ];
    expect(parseFloursFromUrl(formatFloursForUrl(flours))).toEqual(flours);
  });
});

describe('process settings in share links', () => {
  const recipe = calculateRecipeFromTotalWeight({
    total: 750,
    breadType: 'rye',
    hydration: 88,
    saltPercentage: 2,
    flours: [
      { type: 'RY', percentage: 90 },
      { type: 'BF', percentage: 10 },
    ],
    scald: { enabled: true, flourPercentage: 20, waterMultiplier: 2 },
    inclusions: [{ kind: 'sweetener', name: 'Molasses', percentage: 4 }],
    spice: { enabled: true, percentage: 1, use: 'coat' },
  });

  it('round-trips into the same calculated recipe', () => {
    const process = parseProcessFromUrl(formatProcessForUrl(recipe));
    const again = calculateRecipeFromTotalWeight({
      ...process,
      total: recipe.total,
      hydration: recipe.hydration,
      saltPercentage: recipe.saltPercentage,
      flours: parseFloursFromUrl(formatFloursForUrl(recipe.flours)),
    });
    expect(again).toEqual(recipe);
  });

  it('ignores missing or malformed process data', () => {
    expect(parseProcessFromUrl(null)).toEqual({});
    expect(parseProcessFromUrl('not json')).toEqual({});
    expect(parseProcessFromUrl('[1,2]')).toEqual({});
    expect(parseProcessFromUrl('42')).toEqual({});
  });
});
