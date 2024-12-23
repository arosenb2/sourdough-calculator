import { describe, it, expect } from 'vitest';
import { validateFlours, validateSaltPercentage } from './validations';
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
