import { FLOUR_TYPES } from '../types/recipe';
import { levainFlourContribution } from './calculations';

export const validateSaltPercentage = (value) => {
  const saltPercentage = parseFloat(value);
  return saltPercentage >= 1.5 && saltPercentage <= 3;
};

export const validateFlours = (flours) => {
  const total = flours.reduce((sum, flour) => sum + parseFloat(flour.percentage || 0), 0);
  return Math.abs(total - 100) < 0.1; // Allow for small floating point differences
};

export const validateTotalWeight = (weight) => {
  const value = parseFloat(weight);
  return !isNaN(value) && value > 0 && value <= 10000;
};

export const validateHydration = (hydration) => {
  const value = parseFloat(hydration);
  // Scalds and soakers can push total hydration well past 100%
  return !isNaN(value) && value >= 50 && value <= 200;
};

export const validateLevain = (levain) => {
  const percentage = parseFloat(levain?.percentage);
  const ratio = ['seed', 'flour', 'water'].map((k) => parseFloat(levain?.ratio?.[k]));
  return (
    percentage >= 1 && percentage <= 100 &&
    ratio.every((p) => Number.isInteger(p) && p > 0) &&
    validateFlours(levain?.flours || [])
  );
};

export const validateSifting = (sifting) => {
  if (!sifting?.enabled) return true;
  const extraction = parseFloat(sifting.extraction);
  return extraction >= 50 && extraction <= 100;
};

// The scald is a share of flour (the water is its multiplier, checked against the water budget)
export const validateScald = (scald) => {
  if (!scald?.enabled) return true;
  const flour = parseFloat(scald.flourPercentage);
  return flour > 0 && flour <= 100;
};

// Bassinage is a share of flour in water, checked against the water budget too
export const validateBassinage = (bassinage) => {
  if (!bassinage?.enabled) return true;
  return parseFloat(bassinage.percentage) > 0;
};

// All the water drawn from the dough's total (levain, scald, bassinage, soaker, inclusions) must fit
export const validateWaterBudget = (budget) => budget.over <= 1e-9;

export const validateTemps = (temps) =>
  Object.values(temps || {}).every((t) => {
    if (t === '' || t === null || t === undefined) return true;
    const n = parseFloat(t);
    return n >= 32 && n <= 212;
  });

// Fold counts are whole numbers; blank counts as none
export const validateMixing = (mixing) => {
  if (mixing?.type !== 'hand') return true;
  return [mixing.stretchFolds, mixing.coilFolds].every((value) => {
    const n = value === '' || value === undefined ? 0 : Number(value);
    return Number.isInteger(n) && n >= 0 && n <= 20;
  });
};

// Every bake stage needs a sensible oven temperature (°F) and time (minutes)
export const validateBake = (bake) => {
  const stages = bake?.stages;
  if (!Array.isArray(stages) || !stages.length) return false;
  return stages.every((stage) => {
    const temp = parseFloat(stage.temp);
    const minutes = parseFloat(stage.minutes);
    return temp >= 200 && temp <= 600 && minutes >= 1 && minutes <= 300;
  });
};

// Brotgewürz: a small share of flour, with at least one ingredient in the blend
export const validateSpice = (spice) => {
  if (!spice?.enabled) return true;
  const percentage = parseFloat(spice.percentage);
  const ratios = Object.values(spice.ratios || {}).map((r) => (r === '' ? 0 : parseFloat(r)));
  return (
    percentage > 0 && percentage <= 10 &&
    ratios.every((r) => Number.isFinite(r) && r >= 0) &&
    ratios.some((r) => r > 0)
  );
};

/**
 * Checks the overall flour blend against the levain: it must total 100%, include every flour
 * the levain uses, and give each at least the share the levain holds. Returns a message, or
 * null when the blend is fine.
 */
export const blendProblem = (flours, byType) => {
  if (!validateFlours(flours)) return 'Please ensure flour percentages total 100%';
  for (const [type, needed] of Object.entries(byType)) {
    if (needed <= 0) continue;
    const have = parseFloat(flours.find((f) => f.type === type)?.percentage) || 0;
    if (have + 0.05 < needed) {
      return `${FLOUR_TYPES[type]} must be at least ${Math.round(needed * 10) / 10}% of the total flour, since your levain uses that much`;
    }
  }
  return null;
};

export const flourBlendProblem = (flours, levain) => blendProblem(flours, levainFlourContribution(levain).byType);
