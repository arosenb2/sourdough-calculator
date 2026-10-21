import { describe, it, expect } from 'vitest';
import { RYE_DEFAULTS, scaldMultipliersFor } from '../types/recipe';
import { flourBlendProblem } from './validations';
import { withLevainFlours } from './recipeDefaults';
import { waterBudget, waterBudgetMessage } from './calculations';
import { calculateRecipeFromTotalWeight, levainFlourContribution, levainComposition, blendFlours, availableDoughWaterPercentage, soakWaterPercentage, inclusionWaterPercentage, scaldPercentages } from './calculations';

const base = {
  total: 1000,
  hydration: 75,
  saltPercentage: 2,
  flours: [{ type: 'BF', percentage: 100 }],
};

describe('calculateRecipeFromTotalWeight', () => {
  it('counts the levain as part of the total flour and water', () => {
    const r = calculateRecipeFromTotalWeight(base);
    expect(r.flourWeight).toBe(565);
    expect(r.water).toBe(424);
    expect(r.levain.total).toBe(113);
    // 1:5:5 with a 100% hydration starter: half the levain is flour, half water
    expect(r.levain.flourContent).toBe(57);
    expect(r.flours[0]).toMatchObject({ weight: 565, levainWeight: 57, doughWeight: 508 });
    expect(r.doughWater).toBe(367);
  });

  it('matches a hand-calculated 1:10:10 rye levain at 10% prefermented flour', () => {
    const r = calculateRecipeFromTotalWeight({
      total: 850,
      hydration: 86.8,
      saltPercentage: 2,
      flours: [{ type: 'RY', percentage: 100 }],
      levain: { percentage: 10, ratio: { seed: 1, flour: 10, water: 10 }, flours: [{ type: 'RY', percentage: 100 }] },
    });
    expect(r.flourWeight).toBe(450);
    expect(r.levain.flourContent).toBe(45);
    expect(r.levain.total).toBe(90);
    expect(r.levain.weightPercentage).toBeCloseTo(20, 5);
  });

  it('final dough ingredients add up to the total weight', () => {
    const r = calculateRecipeFromTotalWeight(base);
    const sum = r.flours.reduce((s, f) => s + f.doughWeight, 0) + r.waterToAdd + r.levain.total + r.salt;
    expect(Math.abs(sum - r.total)).toBeLessThanOrEqual(2);
  });

  it('derives the levain share of total flour', () => {
    const { total } = levainFlourContribution({ percentage: 10, ratio: { seed: 1, flour: 5, water: 5 } });
    expect(total).toBeCloseTo(10, 5);
    expect(calculateRecipeFromTotalWeight(base).levain.flourPercentage).toBeCloseTo(10, 5);
  });

  it('splits the levain build by ratio and keeps the parts summing to the total', () => {
    const r = calculateRecipeFromTotalWeight({ ...base, levain: { percentage: 10, ratio: { seed: 1, flour: 5, water: 5 } } });
    expect(r.levain.seed + r.levain.flour + r.levain.water).toBe(r.levain.total);
    expect(r.levain.seed).toBe(10);
    expect(r.levain.flour).toBe(51);
  });

  it('keeps levain flour separate from the rest of that flour type', () => {
    const r = calculateRecipeFromTotalWeight({
      ...base,
      flours: [{ type: 'BF', percentage: 80 }, { type: 'RY', percentage: 20 }],
      levain: { percentage: 10, flours: [{ type: 'RY', percentage: 100 }] },
    });
    const [bf, ry] = r.flours;
    expect(bf.levainWeight).toBe(0);
    expect(bf.doughWeight).toBe(bf.weight);
    expect(ry.levainWeight).toBe(r.levain.flourContent);
    expect(ry.doughWeight).toBe(ry.weight - ry.levainWeight);
  });

  it('gives a flour that only the levain uses no main-dough weight', () => {
    const r = calculateRecipeFromTotalWeight({
      ...base,
      flours: [{ type: 'BF', percentage: 90 }, { type: 'RY', percentage: 10 }],
      levain: { percentage: 10, flours: [{ type: 'RY', percentage: 100 }] },
    });
    const ry = r.flours.find((f) => f.type === 'RY');
    expect(ry.doughWeight).toBe(0);
    expect(ry.weight).toBe(ry.levainWeight);
  });

  it('shrinks the flour to make room for inclusions', () => {
    const plain = calculateRecipeFromTotalWeight(base);
    const withSeeds = calculateRecipeFromTotalWeight({ ...base, inclusions: [{ name: 'Seeds', percentage: 10 }] });
    expect(withSeeds.flourWeight).toBeLessThan(plain.flourWeight);
    expect(withSeeds.inclusions[0]).toMatchObject({ name: 'Seeds', weight: 54 });
  });

  it('scalds a share of the flour with 1x-3x its weight in water, out of the dough water', () => {
    // 10% of 565g flour = 57g scald flour; 2x water = 114g
    const r = calculateRecipeFromTotalWeight({ ...base, scald: { enabled: true, flourPercentage: 10, waterMultiplier: 2 } });
    expect(r.scald.flour).toBe(57);
    expect(r.scald.water).toBe(114);
    expect(r.waterToAdd).toBe(r.doughWater - 114);
    const triple = calculateRecipeFromTotalWeight({ ...base, scald: { enabled: true, flourPercentage: 10, waterMultiplier: 3 } });
    expect(triple.scald.water).toBe(171);
  });

  it('caps the scald by the flour and water available', () => {
    const capped = calculateRecipeFromTotalWeight({ ...base, scald: { enabled: true, flourPercentage: 100, waterMultiplier: 3 } });
    expect(capped.scald.flour).toBeLessThanOrEqual(capped.flours.reduce((s, f) => s + f.doughWeight, 0));
    expect(capped.scald.water).toBe(capped.doughWater);
    expect(capped.waterToAdd).toBe(0);
  });

  it('only allows a rye scald up to 2x, and coerces anything wetter', () => {
    expect(scaldMultipliersFor('rye')).toEqual([1, 2]);
    expect(scaldMultipliersFor('traditional')).toEqual([1, 2, 3]);
    const rye = (waterMultiplier) =>
      calculateRecipeFromTotalWeight({ ...base, breadType: 'rye', scald: { enabled: true, flourPercentage: 10, waterMultiplier } });
    expect(rye(1).scald.waterMultiplier).toBe(1);
    expect(rye(2).scald.waterMultiplier).toBe(2);
    expect(rye(3).scald.waterMultiplier).toBe(2);
    const traditional = calculateRecipeFromTotalWeight({ ...base, scald: { enabled: true, flourPercentage: 10, waterMultiplier: 3 } });
    expect(traditional.scald.waterMultiplier).toBe(3);
  });

  it('falls back to 2x for an unsupported multiplier', () => {
    const r = calculateRecipeFromTotalWeight({ ...base, scald: { enabled: true, flourPercentage: 10, waterMultiplier: 5 } });
    expect(r.scald.waterMultiplier).toBe(2);
  });

  it('holds bassinage water back after the scald and caps it', () => {
    const scald = { enabled: true, flourPercentage: 10, waterMultiplier: 2 };
    const r = calculateRecipeFromTotalWeight({ ...base, scald, bassinage: { enabled: true, percentage: 10 } });
    expect(r.bassinage.water).toBe(57);
    expect(r.waterToAdd).toBe(r.doughWater - 114 - 57);
    const capped = calculateRecipeFromTotalWeight({ ...base, scald, bassinage: { enabled: true, percentage: 100 } });
    expect(capped.waterToAdd).toBe(0);
    expect(capped.bassinage.water).toBe(capped.doughWater - 114);
  });

  it('scales scald and bassinage with the dough weight but keeps the same percentages', () => {
    const input = {
      ...base,
      scald: { enabled: true, flourPercentage: 10, waterMultiplier: 2 },
      bassinage: { enabled: true, percentage: 5 },
    };
    const small = calculateRecipeFromTotalWeight({ ...input, total: 500 });
    const large = calculateRecipeFromTotalWeight({ ...input, total: 1000 });
    expect(large.scald.water).toBeGreaterThan(small.scald.water);
    expect(small.scald.flourPercentage).toBe(10);
    expect(large.bassinage.percentage).toBe(5);
  });

  it('bases a traditional scald on the sifted (fresh-milled) flour only', () => {
    const flours = [{ type: 'HR', percentage: 50 }, { type: 'BF', percentage: 50 }];
    const p = scaldPercentages({ ...base, flours, scald: { enabled: true, flourPercentage: 10, waterMultiplier: 2 } });
    // the fresh-milled share of all flour is the 50% entered
    expect(p.flour).toBeCloseTo(5, 5);
    expect(p.water).toBeCloseTo(10, 5);
    // with no fresh-milled flour it falls back to all the flour
    const noFresh = scaldPercentages({ ...base, scald: { enabled: true, flourPercentage: 10, waterMultiplier: 2 } });
    expect(noFresh.flour).toBeCloseTo(10, 5);
  });

  it('bases a rye scald on all the flour, whatever the blend', () => {
    const levain = { percentage: 10, flours: [{ type: 'BF', percentage: 100 }] };
    const scald = { enabled: true, flourPercentage: 20, waterMultiplier: 2 };
    for (const flours of [[{ type: 'RY', percentage: 100 }], [{ type: 'RY', percentage: 50 }, { type: 'BF', percentage: 50 }]]) {
      const p = scaldPercentages({ ...base, breadType: 'rye', levain, flours, scald });
      expect(p.flour).toBeCloseTo(20, 5);
      expect(p.water).toBeCloseTo(40, 5);
    }
  });

  it('reproduces a real 750g rye loaf from the rye defaults', () => {
    // Levain 10g starter + 74g rye + 74g water; scald 77g rye + 154g water; main dough 191g rye,
    // 39g bread flour, 108g water, 15g molasses, 8g salt. 88% hydration, 90% rye, 20% PFF, 20% scald.
    // The defaults use a round 20% PFF (the original levain is 20.5%), hence the few-gram tolerance.
    const r = calculateRecipeFromTotalWeight({
      total: 750,
      breadType: 'rye',
      hydration: RYE_DEFAULTS.hydration,
      saltPercentage: RYE_DEFAULTS.salt,
      flours: RYE_DEFAULTS.flours,
      scald: { enabled: true },
      inclusions: [{ kind: 'sweetener', name: 'Molasses', percentage: 3.9 }],
    });
    const near = (actual, expected, tolerance = 1) => expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
    near(r.levain.seed, 10);
    near(r.levain.flour, 74, 2);
    near(r.levain.water, 74, 2);
    near(r.levain.total, 158, 3);
    near(r.scald.flour, 77);
    near(r.scald.water, 154);
    near(r.salt, 8);
    near(r.inclusions[0].weight, 15);
    const ry = r.flours.find((f) => f.type === 'RY');
    const bf = r.flours.find((f) => f.type === 'BF');
    near(ry.scaldWeight, 77);
    near(ry.mainWeight, 191, 4);
    near(bf.mainWeight, 39);
    near(r.waterToAdd, 108, 4);
    expect(r.levain.flourPercentage).toBe(20);
    expect(r.hydration).toBe(88);
    // overall: 90% rye, and the scald is 20% of all flour
    near(ry.overallPercentage, 90, 0.05);
    near(r.scald.flour / r.flourWeight, 0.2, 0.005);
  });

  it('defaults a rye scald to 20% of the flour, traditional to 10% of the sifted flour', () => {
    const scald = { enabled: true };
    expect(calculateRecipeFromTotalWeight({ ...base, breadType: 'rye', scald }).scald.flourPercentage).toBe(20);
    expect(calculateRecipeFromTotalWeight({ ...base, scald }).scald.flourPercentage).toBe(10);
  });

  it('splits each flour into scald and main dough, drawing the scald from the rye', () => {
    const r = calculateRecipeFromTotalWeight({
      ...base,
      breadType: 'rye',
      flours: [{ type: 'RY', percentage: 70 }, { type: 'BF', percentage: 30 }],
      scald: { enabled: true, flourPercentage: 20, waterMultiplier: 2 },
    });
    const bf = r.flours.find((f) => f.type === 'BF');
    const ry = r.flours.find((f) => f.type === 'RY');
    expect(bf.scaldWeight).toBe(0);
    expect(ry.scaldWeight).toBe(r.scald.flour);
    r.flours.forEach((f) => expect(f.scaldWeight + f.mainWeight).toBe(f.doughWeight));
    expect(r.flours.reduce((sum, f) => sum + f.scaldWeight, 0)).toBe(r.scald.flour);
  });

  it('spreads a traditional scald over the fresh-milled flours only', () => {
    const r = calculateRecipeFromTotalWeight({
      ...base,
      flours: [{ type: 'HR', percentage: 40 }, { type: 'HW', percentage: 20 }, { type: 'BF', percentage: 40 }],
      scald: { enabled: true, flourPercentage: 10, waterMultiplier: 2 },
    });
    expect(r.flours.find((f) => f.type === 'BF').scaldWeight).toBe(0);
    expect(r.flours.find((f) => f.type === 'HR').scaldWeight).toBeGreaterThan(r.flours.find((f) => f.type === 'HW').scaldWeight);
    expect(r.flours.reduce((sum, f) => sum + f.scaldWeight, 0)).toBe(r.scald.flour);
  });

  it('gives no scald weights when there is no scald', () => {
    const r = calculateRecipeFromTotalWeight(base);
    r.flours.forEach((f) => {
      expect(f.scaldWeight).toBe(0);
      expect(f.mainWeight).toBe(f.doughWeight);
    });
  });

  it('requires sifting for a traditional scald but not for rye', () => {
    const scald = { enabled: true, flourPercentage: 10, waterMultiplier: 2 };
    expect(calculateRecipeFromTotalWeight({ ...base, scald }).sifting.enabled).toBe(true);
    expect(calculateRecipeFromTotalWeight({ ...base, breadType: 'rye', scald }).sifting.enabled).toBe(false);
    expect(calculateRecipeFromTotalWeight(base).sifting.enabled).toBe(false);
  });

  it('rounds any decimal feeding ratio to whole numbers', () => {
    const r = calculateRecipeFromTotalWeight({ ...base, levain: { percentage: 10, ratio: { seed: 1, flour: 7.4, water: 7.6 } } });
    expect(r.levain.ratio).toEqual({ seed: 1, flour: 7, water: 8 });
    // a ratio that rounds to zero falls back to the default
    expect(calculateRecipeFromTotalWeight({ ...base, levain: { percentage: 10, ratio: { seed: 0.4, flour: 5, water: 5 } } }).levain.ratio).toEqual({ seed: 1, flour: 5, water: 5 });
  });

  it('defaults a rye levain to 20% prefermented flour at 1:7:7, traditional to 10% at 1:5:5', () => {
    const rye = calculateRecipeFromTotalWeight({ ...base, breadType: 'rye' }).levain;
    expect(rye.percentage).toBe(20);
    expect(rye.ratio).toEqual({ seed: 1, flour: 7, water: 7 });
    const traditional = calculateRecipeFromTotalWeight(base).levain;
    expect(traditional.percentage).toBe(10);
    expect(traditional.ratio).toEqual({ seed: 1, flour: 5, water: 5 });
  });

  it('is stable when a calculated recipe is calculated again (saved recipes)', () => {
    const once = calculateRecipeFromTotalWeight({ ...base, breadType: 'rye', scald: { enabled: true, flourPercentage: 15, waterMultiplier: 2 } });
    expect(calculateRecipeFromTotalWeight(once)).toEqual(once);
  });

  it('handles old recipes saved without process fields', () => {
    const r = calculateRecipeFromTotalWeight({ ...base, levain: 102, water: 381 });
    expect(r.breadType).toBe('traditional');
    expect(r.method).toBe('autolyse');
    expect(r.levain.percentage).toBe(10);
  });

  it('uses a single mix for rye', () => {
    expect(calculateRecipeFromTotalWeight({ ...base, breadType: 'rye', method: 'fermentolyse' }).method).toBe('mix');
  });
});

describe('levainComposition', () => {
  it('is 50% flour and 100% hydration when flour and water are equal', () => {
    const c = levainComposition({ ratio: { seed: 1, flour: 5, water: 5 } });
    expect(c.flourPercentage).toBeCloseTo(50, 5);
    expect(c.hydration).toBeCloseTo(100, 5);
  });

  it('reflects a wetter or stiffer feed', () => {
    expect(levainComposition({ ratio: { seed: 1, flour: 2, water: 4 } }).hydration).toBeCloseTo(180, 5);
    expect(levainComposition({ ratio: { seed: 1, flour: 4, water: 2 } }).hydration).toBeCloseTo(55.6, 1);
  });
});

describe('seeds, sweeteners and Brotgewürz', () => {
  const seeds = { kind: 'seed', name: 'Sunflower seeds', percentage: 20, soaked: true, soakWaterPercentage: 100 };

  it('soaks seeds in water that comes out of the dough water', () => {
    const r = calculateRecipeFromTotalWeight({ ...base, inclusions: [seeds] });
    const seed = r.inclusions[0];
    expect(seed.soakWater).toBe(seed.weight);
    expect(r.soakWater).toBe(seed.soakWater);
    expect(r.waterToAdd).toBe(r.doughWater - seed.soakWater);
  });

  it('does not take water for seeds that are not soaked', () => {
    const r = calculateRecipeFromTotalWeight({ ...base, inclusions: [{ ...seeds, soaked: false }] });
    expect(r.soakWater).toBe(0);
    expect(r.waterToAdd).toBe(r.doughWater);
  });

  it('takes soak water before scald and bassinage', () => {
    const r = calculateRecipeFromTotalWeight({
      ...base,
      inclusions: [seeds],
      scald: { enabled: true, flourPercentage: 100, waterMultiplier: 3 },
      bassinage: { enabled: true, percentage: 100 },
    });
    expect(r.scald.water).toBe(r.doughWater - r.soakWater);
    expect(r.bassinage.water).toBe(0);
    expect(r.waterToAdd).toBe(0);
  });

  it('gives sweeteners a weight as a percentage of flour', () => {
    const r = calculateRecipeFromTotalWeight({ ...base, inclusions: [{ kind: 'sweetener', name: 'Molasses', percentage: 5 }] });
    expect(r.inclusions[0]).toMatchObject({ kind: 'sweetener', name: 'Molasses' });
    expect(r.inclusions[0].weight).toBeGreaterThan(0);
  });

  it('computes the soak water percentage without a weight', () => {
    expect(soakWaterPercentage([seeds])).toBeCloseTo(20, 5);
    expect(soakWaterPercentage([{ ...seeds, soakWaterPercentage: 150 }])).toBeCloseTo(30, 5);
    expect(soakWaterPercentage([{ ...seeds, soaked: false }])).toBe(0);
  });

  it('splits Brotgewürz by ratio with one-decimal weights', () => {
    const r = calculateRecipeFromTotalWeight({
      ...base,
      spice: { enabled: true, percentage: 2, use: 'coat', ratios: { caraway: 3, coriander: 1, fennel: 0, anise: 0, allspice: 0 } },
    });
    expect(r.spice.use).toBe('coat');
    expect(r.spice.blend.map((b) => b.type)).toEqual(['caraway', 'coriander']);
    expect(r.spice.blend[0].weight).toBeCloseTo(r.spice.total * 0.75, 0);
    expect(r.spice.total).toBeCloseTo(11.2, 1);
  });

  it('ignores Brotgewürz when off and keeps the total weight with it on', () => {
    expect(calculateRecipeFromTotalWeight(base).spice.total).toBe(0);
    const on = calculateRecipeFromTotalWeight({ ...base, spice: { enabled: true, percentage: 5 } });
    expect(on.flourWeight).toBeLessThan(calculateRecipeFromTotalWeight(base).flourWeight);
  });

  it('defaults an empty or all-zero blend and bad kinds', () => {
    const r = calculateRecipeFromTotalWeight({
      ...base,
      spice: { enabled: true, ratios: { caraway: 0 } },
      inclusions: [{ kind: 'bogus', name: 'Raisins', percentage: 5 }],
    });
    expect(r.spice.blend.length).toBe(5);
    expect(r.inclusions[0].kind).toBe('other');
  });

  it('is stable when calculated again', () => {
    const once = calculateRecipeFromTotalWeight({
      ...base,
      breadType: 'rye',
      inclusions: [seeds, { kind: 'sweetener', name: 'Honey', percentage: 3 }],
      spice: { enabled: true, percentage: 1, use: 'mix' },
    });
    expect(calculateRecipeFromTotalWeight(once)).toEqual(once);
  });
});

describe('water carried by inclusions', () => {
  const honey = { kind: 'sweetener', name: 'Honey', percentage: 10 };

  it('fills in the water content of known ingredients', () => {
    const r = calculateRecipeFromTotalWeight({ ...base, inclusions: [honey, { kind: 'other', name: 'egg', percentage: 5 }] });
    expect(r.inclusions[0].hydration).toBe(17);
    expect(r.inclusions[1].hydration).toBe(75);
  });

  it('never lets a manual value override a known ingredient', () => {
    const r = calculateRecipeFromTotalWeight({
      ...base,
      inclusions: [{ ...honey, hydration: 40 }, { kind: 'other', name: 'Butter', percentage: 5, hydration: 0 }],
    });
    expect(r.inclusions[0].hydration).toBe(17);
    expect(r.inclusions[1].hydration).toBe(16);
  });

  it('matches known names whatever the case or spacing', () => {
    const r = calculateRecipeFromTotalWeight({ ...base, inclusions: [{ kind: 'other', name: '  PUMPKIN puree ', percentage: 10, hydration: 5 }] });
    expect(r.inclusions[0].hydration).toBe(90);
  });

  it('takes a hand-entered water content only for custom ingredients, defaulting to dry', () => {
    const r = calculateRecipeFromTotalWeight({
      ...base,
      inclusions: [
        { kind: 'other', name: 'Cooked oats', percentage: 10, hydration: 60 },
        { kind: 'other', name: 'Walnuts', percentage: 10 },
        { kind: 'other', name: 'Too wet', percentage: 10, hydration: 400 },
      ],
    });
    expect(r.inclusions[0].hydration).toBe(60);
    expect(r.inclusions[1].hydration).toBe(0);
    expect(r.inclusions[1].water).toBe(0);
    expect(r.inclusions[2].hydration).toBe(100);
  });

  it('takes that water out of the water to add so hydration stays true', () => {
    const dry = calculateRecipeFromTotalWeight({ ...base, inclusions: [{ kind: 'other', name: 'Dry thing', percentage: 10, hydration: 0 }] });
    const wet = calculateRecipeFromTotalWeight({ ...base, inclusions: [{ kind: 'other', name: 'Wet thing', percentage: 10, hydration: 20 }] });
    expect(wet.water).toBe(dry.water);
    expect(wet.inclusionWater).toBe(wet.inclusions[0].water);
    expect(wet.waterToAdd).toBe(dry.waterToAdd - wet.inclusionWater);
  });

  it('does not count a seed as carrying water, and takes inclusion water after the soaker', () => {
    const seeds = { kind: 'seed', name: 'Egg', percentage: 10, soaked: true, soakWaterPercentage: 100 };
    const r = calculateRecipeFromTotalWeight({ ...base, inclusions: [seeds, { kind: 'other', name: 'Milk', percentage: 10 }] });
    expect(r.inclusions[0].hydration).toBe(0);
    expect(r.waterToAdd).toBe(r.doughWater - r.soakWater - r.inclusionWater);
  });

  it('computes the percentage of flour without a weight, and caps to the water available', () => {
    expect(inclusionWaterPercentage([{ kind: 'other', name: 'Pumpkin puree', percentage: 20 }])).toBeCloseTo(18, 5);
    const r = calculateRecipeFromTotalWeight({ ...base, inclusions: [{ kind: 'other', name: 'Milk', percentage: 100, hydration: 100 }] });
    expect(r.waterToAdd).toBe(0);
    expect(r.inclusionWater).toBe(r.doughWater);
  });
});

describe('availableDoughWaterPercentage', () => {
  it('is hydration minus the water already in the levain, without needing a weight', () => {
    // 10% prefermented flour at 100% levain hydration holds 10% of flour as water
    const levain = { percentage: 10, ratio: { seed: 1, flour: 5, water: 5 } };
    expect(availableDoughWaterPercentage(levain, 75)).toBeCloseTo(65, 5);
    expect(calculateRecipeFromTotalWeight({ ...base, levain }).doughWater / 565 * 100).toBeCloseTo(65, 0);
  });
});

describe('blendFlours', () => {
  const ryeLevain = { percentage: 10, ratio: { seed: 1, flour: 5, water: 5 }, flours: [{ type: 'RY', percentage: 100 }] };
  const byType = (rows, key = 'overall') => Object.fromEntries(rows.map((r) => [r.type, r[key]]));

  it('keeps the overall percentages entered, and splits each into levain and main dough', () => {
    const rows = blendFlours([{ type: 'BF', percentage: 80 }, { type: 'RY', percentage: 20 }], ryeLevain);
    expect(byType(rows).BF).toBeCloseTo(80, 5);
    expect(byType(rows).RY).toBeCloseTo(20, 5);
    expect(byType(rows, 'levain').RY).toBeCloseTo(10, 5);
    expect(byType(rows, 'dough').RY).toBeCloseTo(10, 5);
    expect(byType(rows, 'dough').BF).toBeCloseTo(80, 5);
  });

  it('matches a recipe given as PFF, scald, main rye and bread flour', () => {
    // 40% PFF (rye), 20% scalded rye, 30% main rye, 10% bread flour: 90% rye overall
    const levain = { percentage: 40, ratio: { seed: 1, flour: 7, water: 7 }, flours: [{ type: 'RY', percentage: 100 }] };
    const rows = blendFlours([{ type: 'RY', percentage: 90 }, { type: 'BF', percentage: 10 }], levain);
    expect(byType(rows).RY).toBeCloseTo(90, 5);
    expect(byType(rows, 'levain').RY).toBeCloseTo(40, 5);
    expect(byType(rows, 'dough').RY).toBeCloseTo(50, 5); // 20 scald + 30 main
    expect(byType(rows, 'dough').BF).toBeCloseTo(10, 5);
  });

  it('raises a flour below its levain share to the minimum, trimming the others', () => {
    const rows = blendFlours([{ type: 'BF', percentage: 95 }, { type: 'RY', percentage: 5 }], ryeLevain);
    expect(byType(rows).RY).toBeCloseTo(10, 5);
    expect(byType(rows).BF).toBeCloseTo(90, 5);
  });

  it('adds a levain flour that is missing from the blend at its minimum', () => {
    const rows = blendFlours([{ type: 'BF', percentage: 100 }], ryeLevain);
    expect(byType(rows).RY).toBeCloseTo(10, 5);
    expect(byType(rows).BF).toBeCloseTo(90, 5);
    expect(rows.reduce((sum, r) => sum + r.overall, 0)).toBeCloseTo(100, 5);
  });

  it('orders flours from highest to lowest overall percentage', () => {
    const rows = blendFlours(
      [{ type: 'WW', percentage: 10 }, { type: 'BF', percentage: 50 }, { type: 'SP', percentage: 30 }, { type: 'RY', percentage: 10 }],
      ryeLevain
    );
    const overall = rows.map((r) => r.overall);
    expect(overall).toEqual([...overall].sort((a, b) => b - a));
    expect(rows[0].type).toBe('BF');
  });

  it('does not depend on hydration', () => {
    const flours = [{ type: 'BF', percentage: 90 }, { type: 'RY', percentage: 10 }];
    const a = calculateRecipeFromTotalWeight({ ...base, flours, hydration: 70, levain: ryeLevain });
    const b = calculateRecipeFromTotalWeight({ ...base, flours, hydration: 85, levain: ryeLevain });
    expect(a.flours.map((f) => f.overallPercentage)).toEqual(b.flours.map((f) => f.overallPercentage));
  });
});

// The flour rule is the same for rye and traditional: enter overall targets, the levain's flour
// counts toward them, and each levain flour has a minimum.
describe.each(['rye', 'traditional'])('overall flour targets (%s)', (breadType) => {
  const levain = { percentage: 40, ratio: { seed: 1, flour: 7, water: 7 }, flours: [{ type: 'RY', percentage: 100 }] };
  const flours = [{ type: 'RY', percentage: 90 }, { type: 'BF', percentage: 10 }];
  const calc = (extra = {}) => calculateRecipeFromTotalWeight({ ...base, breadType, hydration: 90, levain, flours, ...extra });

  it('ends up at exactly the entered percentages', () => {
    const r = calc();
    expect(r.flours.find((f) => f.type === 'RY').overallPercentage).toBeCloseTo(90, 5);
    expect(r.flours.find((f) => f.type === 'BF').overallPercentage).toBeCloseTo(10, 5);
    expect(r.flours.find((f) => f.type === 'RY').weight / r.flourWeight).toBeCloseTo(0.9, 2);
  });

  it('holds the levain flour inside the target and leaves the rest for the dough', () => {
    const r = calc();
    const ry = r.flours.find((f) => f.type === 'RY');
    expect(ry.levainWeight).toBeCloseTo(r.flourWeight * 0.4, -1);
    expect(ry.doughWeight).toBe(ry.weight - ry.levainWeight);
    expect(r.flours.find((f) => f.type === 'BF').levainWeight).toBe(0);
  });

  it('draws a scald from the main flour, so the scald plus main add up to the dough flour', () => {
    const r = calc({ scald: { enabled: true, flourPercentage: 20, waterMultiplier: 2 } });
    r.flours.forEach((f) => expect(f.scaldWeight + f.mainWeight).toBe(f.doughWeight));
    expect(r.flours.reduce((sum, f) => sum + f.scaldWeight, 0)).toBe(r.scald.flour);
  });

  it('enforces the same minimum, and reports the same problem', () => {
    expect(flourBlendProblem([{ type: 'RY', percentage: 90 }, { type: 'BF', percentage: 10 }], levain)).toBeNull();
    expect(flourBlendProblem([{ type: 'RY', percentage: 30 }, { type: 'BF', percentage: 70 }], levain)).toMatch(/at least 40%/);
    expect(flourBlendProblem([{ type: 'BF', percentage: 100 }], levain)).toMatch(/Rye/);
  });

  it('gives the same flour split for the same inputs', () => {
    const other = breadType === 'rye' ? 'traditional' : 'rye';
    const same = calculateRecipeFromTotalWeight({ ...base, breadType: other, hydration: 90, levain, flours });
    expect(same.flours).toEqual(calc().flours);
  });
});

describe('waterBudget', () => {
  const rye = {
    breadType: 'rye',
    flours: RYE_DEFAULTS.flours,
    levain: { percentage: 40, ratio: { seed: 1, flour: 7, water: 7 }, flours: [{ type: 'RY', percentage: 100 }] },
    hydration: 90,
  };

  it('fits a 2x scald of 20% but not a bigger scald of 30% at 40% PFF and 90% hydration', () => {
    const two = waterBudget({ ...rye, scald: { enabled: true, flourPercentage: 20, waterMultiplier: 2 } });
    expect(two.parts.levain).toBeCloseTo(40, 1);
    expect(two.parts.scald).toBeCloseTo(40, 5);
    expect(two.over).toBeLessThanOrEqual(0);

    const three = waterBudget({ ...rye, scald: { enabled: true, flourPercentage: 30, waterMultiplier: 2 } });
    expect(three.parts.scald).toBeCloseTo(60, 5);
    expect(three.over).toBeCloseTo(10, 1); // 40 + 60 = 100% of flour against 90% hydration
  });

  it('explains the overshoot and what to raise', () => {
    const budget = waterBudget({ ...rye, scald: { enabled: true, flourPercentage: 30, waterMultiplier: 2 } });
    const message = waterBudgetMessage(budget);
    expect(message).toContain('100%');
    expect(message).toContain('90%');
    expect(message).toMatch(/levain 40%, scald 60%/);
    expect(message).toMatch(/at least 100%/);
  });

  it('has no message when the water fits', () => {
    expect(waterBudgetMessage(waterBudget({ ...rye, scald: { enabled: true, flourPercentage: 20, waterMultiplier: 2 } }))).toBeNull();
  });

  it('counts bassinage, soaker and inclusion water too', () => {
    const b = waterBudget({
      ...rye,
      scald: { enabled: false },
      bassinage: { enabled: true, percentage: 5 },
      inclusions: [
        { kind: 'seed', name: 'Flax', percentage: 10, soaked: true, soakWaterPercentage: 100 },
        { kind: 'other', name: 'Milk', percentage: 10 },
      ],
    });
    expect(b.parts.bassinage).toBe(5);
    expect(b.parts.soaker).toBeCloseTo(10, 5);
    expect(b.parts.inclusions).toBeCloseTo(8.7, 5);
  });
});

describe('withLevainFlours', () => {
  const byType = { RY: 10 };

  it('adds a missing levain flour at its minimum and trims the flour with the most room', () => {
    const next = withLevainFlours([{ type: 'BF', percentage: 100 }], byType);
    expect(next).toEqual([{ type: 'BF', percentage: 90 }, { type: 'RY', percentage: 10 }]);
  });

  it('rounds the minimum up to a tenth', () => {
    const next = withLevainFlours([{ type: 'BF', percentage: 100 }], { RY: 9.55 });
    expect(next.find((f) => f.type === 'RY').percentage).toBe(9.6);
    expect(next.reduce((sum, f) => sum + f.percentage, 0)).toBeCloseTo(100, 5);
  });

  it('leaves the blend alone when every levain flour is already in it', () => {
    const flours = [{ type: 'BF', percentage: 80 }, { type: 'RY', percentage: 20 }];
    expect(withLevainFlours(flours, byType)).toBe(flours);
  });

  it('never trims a flour below its own minimum', () => {
    const next = withLevainFlours([{ type: 'RY', percentage: 12 }, { type: 'BF', percentage: 88 }], { RY: 12, WW: 20 });
    expect(next.find((f) => f.type === 'RY').percentage).toBe(12);
    expect(next.find((f) => f.type === 'WW').percentage).toBe(20);
  });
});
