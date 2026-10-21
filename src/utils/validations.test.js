import { describe, it, expect } from 'vitest';
import { validateFlours, validateSaltPercentage, validateMixing, validateBake, validateWaterBudget, validateSpice, validateHydration, validateLevain } from './validations';
import { FLOUR_TYPES } from '../types/recipe';

describe('validateSaltPercentage', () => {
  // Valid cases
  it('should return true for minimum valid salt percentage (1.5%)', () => {
    expect(validateSaltPercentage(1.5)).toBe(true);
  });

  it('should return true for maximum valid salt percentage (3%)', () => {
    expect(validateSaltPercentage(3)).toBe(true);
  });

  it('should return true for salt percentage in valid range (2.25%)', () => {
    expect(validateSaltPercentage(2.25)).toBe(true);
  });

  // Invalid cases
  it('should return false for salt percentage below minimum', () => {
    expect(validateSaltPercentage(1.4)).toBe(false);
  });

  it('should return false for salt percentage above maximum', () => {
    expect(validateSaltPercentage(3.1)).toBe(false);
  });
});

describe('validateFlours', () => {
  it('should return true when flour percentages total 100', () => {
    const flours = [
      { type: FLOUR_TYPES.BF, percentage: 70 },
      { type: FLOUR_TYPES.WW, percentage: 30 }
    ];
    expect(validateFlours(flours)).toBe(true);
  });

  it('should return true for single flour at 100%', () => {
    const flours = [
      { type: FLOUR_TYPES.BF, percentage: 100 }
    ];
    expect(validateFlours(flours)).toBe(true);
  });

  it('should return true for multiple flours with decimal percentages', () => {
    const flours = [
      { type: FLOUR_TYPES.BF, percentage: 33.3 },
      { type: FLOUR_TYPES.WW, percentage: 33.3 },
      { type: FLOUR_TYPES.RY, percentage: 33.4 }
    ];
    expect(validateFlours(flours)).toBe(true);
  });

  it('should return false when flour percentages do not total 100', () => {
    const flours = [
      { type: FLOUR_TYPES.BF, percentage: 70 },
      { type: FLOUR_TYPES.WW, percentage: 20 }
    ];
    expect(validateFlours(flours)).toBe(false);
  });

  it('should return false for empty flour array', () => {
    expect(validateFlours([])).toBe(false);
  });

  it('should return false when percentages are missing', () => {
    const flours = [
      { type: FLOUR_TYPES.BF },
      { type: FLOUR_TYPES.WW, percentage: 50 }
    ];
    expect(validateFlours(flours)).toBe(false);
  });
});


describe('validateMixing', () => {
  it('accepts whole-number fold counts, blank counts, and any stand mixer setting', () => {
    expect(validateMixing({ type: 'hand', stretchFolds: 4, coilFolds: '' })).toBe(true);
    expect(validateMixing({ type: 'stand', stretchFolds: 99, coilFolds: -1 })).toBe(true);
  });

  it('rejects fractional, negative or huge hand fold counts', () => {
    expect(validateMixing({ type: 'hand', stretchFolds: 2.5, coilFolds: 0 })).toBe(false);
    expect(validateMixing({ type: 'hand', stretchFolds: -1, coilFolds: 0 })).toBe(false);
    expect(validateMixing({ type: 'hand', stretchFolds: 4, coilFolds: 21 })).toBe(false);
  });
});


describe('validateBake', () => {
  const stage = { mode: 'dry', temp: 450, minutes: 30 };

  it('accepts stages with sensible temperatures and times', () => {
    expect(validateBake({ stages: [stage, { ...stage, temp: '475', minutes: '20' }] })).toBe(true);
  });

  it('rejects no stages, blank values and out-of-range values', () => {
    expect(validateBake({ stages: [] })).toBe(false);
    expect(validateBake({ stages: [{ ...stage, temp: '' }] })).toBe(false);
    expect(validateBake({ stages: [{ ...stage, minutes: 0 }] })).toBe(false);
    expect(validateBake({ stages: [{ ...stage, temp: 700 }] })).toBe(false);
  });
});


describe('validateWaterBudget', () => {
  it('accepts a budget that fits within the hydration', () => {
    expect(validateWaterBudget({ over: -5 })).toBe(true);
    expect(validateWaterBudget({ over: 0 })).toBe(true);
  });

  it('rejects a budget that overshoots', () => {
    expect(validateWaterBudget({ over: 12 })).toBe(false);
  });
});

describe('validateSpice', () => {
  const spice = { enabled: true, percentage: 1, ratios: { caraway: 4, coriander: 2, fennel: '', anise: 0, allspice: 1 } };

  it('accepts a sensible blend, or anything when off', () => {
    expect(validateSpice(spice)).toBe(true);
    expect(validateSpice({ enabled: false, percentage: 99, ratios: {} })).toBe(true);
  });

  it('rejects a bad percentage or an empty blend', () => {
    expect(validateSpice({ ...spice, percentage: 0 })).toBe(false);
    expect(validateSpice({ ...spice, percentage: 11 })).toBe(false);
    expect(validateSpice({ ...spice, ratios: { caraway: 0, coriander: '' } })).toBe(false);
  });
});


describe('validateHydration', () => {
  it('allows the high hydrations that scalds and soakers produce', () => {
    expect(validateHydration(75)).toBe(true);
    expect(validateHydration(134)).toBe(true);
    expect(validateHydration(200)).toBe(true);
  });

  it('rejects values that are too low, too high or not numbers', () => {
    expect(validateHydration(49)).toBe(false);
    expect(validateHydration(201)).toBe(false);
    expect(validateHydration('')).toBe(false);
  });
});


describe('validateLevain', () => {
  const levain = { percentage: 20, ratio: { seed: 1, flour: 7, water: 7 }, flours: [{ type: 'RY', percentage: 100 }] };

  it('accepts a whole-number ratio, including string input from the field', () => {
    expect(validateLevain(levain)).toBe(true);
    expect(validateLevain({ ...levain, ratio: { seed: '10', flour: '73', water: '73' } })).toBe(true);
  });

  it('rejects decimal, zero or blank ratio parts', () => {
    expect(validateLevain({ ...levain, ratio: { seed: 1, flour: 7.4, water: 7.4 } })).toBe(false);
    expect(validateLevain({ ...levain, ratio: { seed: 1, flour: 0, water: 7 } })).toBe(false);
    expect(validateLevain({ ...levain, ratio: { seed: 1, flour: '', water: 7 } })).toBe(false);
  });
});
