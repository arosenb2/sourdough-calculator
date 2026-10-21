import { describe, it, expect } from 'vitest';
import { RYE_DEFAULTS } from '../types/recipe';
import { calculateRecipeFromTotalWeight } from './calculations';
import {
  defaultWizardData,
  toFormula,
  typeDefaults,
  wizardDataFromRecipe,
  wizardDataToRecipe,
} from './recipeDefaults';

const ryeFormula = () =>
  toFormula({
    breadType: 'rye',
    hydration: 88,
    saltPercentage: 2,
    flours: RYE_DEFAULTS.flours,
    levain: { percentage: 20, ratio: { seed: 1, flour: 7, water: 7 }, flours: [{ type: 'RY', percentage: 100 }] },
    scald: { enabled: true, flourPercentage: 20, waterMultiplier: 2 },
    bassinage: { enabled: true, percentage: 5 },
    temps: { levain: 80, dough: 85, scald: 200 },
    inclusions: [
      { kind: 'seed', name: 'Flax', percentage: 10, soaked: true, soakWaterPercentage: 100 },
      { kind: 'sweetener', name: 'Molasses', percentage: 4 },
    ],
    spice: { enabled: true, percentage: 1, use: 'coat' },
  });

describe('editing a saved recipe', () => {
  it('leaves out the dough weight when a recipe is saved', () => {
    const formula = ryeFormula();
    expect('total' in formula).toBe(false);
    expect(formula.hydration).toBe(88);
  });

  it('comes back unchanged after a trip through the wizard', () => {
    const formula = ryeFormula();
    const back = toFormula(wizardDataToRecipe(wizardDataFromRecipe(formula)));
    expect(back).toEqual(formula);
  });

  it('round-trips a plain traditional recipe too', () => {
    const formula = toFormula({
      breadType: 'traditional',
      hydration: 75,
      saltPercentage: 2,
      flours: [{ type: 'BF', percentage: 100 }],
    });
    expect(toFormula(wizardDataToRecipe(wizardDataFromRecipe(formula)))).toEqual(formula);
  });

  it('opens with no dough weight and blank (not null) temperatures', () => {
    const data = wizardDataFromRecipe(toFormula({ breadType: 'traditional', hydration: 75, saltPercentage: 2, flours: [{ type: 'BF', percentage: 100 }] }));
    expect(data.totalWeight).toBe('');
    expect(data.temps).toEqual({ levain: '', dough: '', scald: '' });
    expect(data.hydration).toBe(75);
    expect(data.salt).toBe(2);
  });

  it('turns text typed in the wizard into numbers when saving', () => {
    const data = { ...wizardDataFromRecipe(ryeFormula()), hydration: '90', salt: '2.5', flours: [{ type: 'RY', percentage: '85.5' }, { type: 'BF', percentage: '14.5' }] };
    const formula = toFormula(wizardDataToRecipe(data));
    expect(formula.hydration).toBe(90);
    expect(formula.saltPercentage).toBe(2.5);
    expect(formula.flours).toEqual([{ type: 'RY', percentage: 85.5 }, { type: 'BF', percentage: 14.5 }]);
  });

  it('a tweaked recipe calculates differently once a weight is chosen', () => {
    const formula = ryeFormula();
    const tweaked = toFormula(wizardDataToRecipe({ ...wizardDataFromRecipe(formula), hydration: '95' }));
    const a = calculateRecipeFromTotalWeight({ ...formula, total: 800 });
    const b = calculateRecipeFromTotalWeight({ ...tweaked, total: 800 });
    expect(b.hydration).toBe(95);
    expect(b.waterToAdd).toBeGreaterThan(a.waterToAdd);
  });

  it('does not mutate the saved recipe while it is being edited', () => {
    const formula = ryeFormula();
    const snapshot = JSON.stringify(formula);
    const data = wizardDataFromRecipe(formula);
    data.levain.ratio.flour = 99;
    data.bake.stages[0].temp = 999;
    data.spice.ratios.caraway = 99;
    data.inclusions[0].name = 'changed';
    expect(JSON.stringify(formula)).toBe(snapshot);
  });

  it('starts a new recipe with no dough weight and the rye defaults on demand', () => {
    expect(defaultWizardData().totalWeight).toBe('');
    expect(typeDefaults('rye').hydration).toBe('88');
  });
});
