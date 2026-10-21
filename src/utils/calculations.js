import { FLOUR_GROUPS, RYE_FLOURS } from '../types/recipe';
import { normalizeRecipe } from './recipeDefaults';

const FRESH_MILLED = new Set(Object.keys(FLOUR_GROUPS.find((group) => group.id === 'fresh').flours));

// Which flours a scald draws from: all the rye, or the fresh-milled flour that gets sifted
const scaldKinds = (breadType) => (breadType === 'rye' ? RYE_FLOURS : FRESH_MILLED);

export const roundWeight = (weight) => {
  return Math.round(weight);
};

// The starter is assumed to be 100% hydration: half flour, half water.
const SEED_FLOUR_FRACTION = 0.5;

const levainFractions = ({ seed, flour, water }) => {
  const parts = seed + flour + water;
  return {
    seed: seed / parts,
    feedFlour: flour / parts,
    feedWater: water / parts,
    flour: (seed * SEED_FLOUR_FRACTION + flour) / parts,
    water: (seed * (1 - SEED_FLOUR_FRACTION) + water) / parts,
  };
};

/**
 * Estimated makeup of the levain from its feeding ratio: the share of its
 * weight that is flour, and its hydration (water / flour).
 */
export const levainComposition = (levain) => {
  const { levain: l } = normalizeRecipe({ levain });
  const fractions = levainFractions(l.ratio);
  return {
    flourPercentage: fractions.flour * 100,
    hydration: (fractions.water / fractions.flour) * 100,
  };
};

const levainFlourShares = (levainFlours) => {
  const sum = levainFlours.reduce((total, f) => total + f.percentage, 0) || 1;
  return Object.fromEntries(levainFlours.map((f) => [f.type, f.percentage / sum]));
};

/**
 * How much of the total flour sits in the levain (the prefermented flour the
 * user enters), split by flour type: { total: % of all flour, byType: {...} }.
 */
export const levainFlourContribution = (levain) => {
  const { levain: l } = normalizeRecipe({ levain });
  const total = l.percentage;
  const shares = levainFlourShares(l.flours);
  return {
    total,
    byType: Object.fromEntries(Object.entries(shares).map(([type, share]) => [type, total * share])),
  };
};

/**
 * Splits the overall flour blend (what the user enters: % of ALL flour per type) into the
 * flour held in the levain and the flour mixed into the dough ("main" flour, which is also
 * where a scald draws from). No hydration needed: it only depends on the levain.
 *
 * Each flour used in the levain can't be below its levain share, and every levain flour has
 * to be in the blend. Input that breaks that is repaired: those flours are raised to their
 * minimum and the excess is taken from the flours that have room, in proportion.
 * Rows are { type, overall, levain, dough } as % of total flour, largest first.
 */
export const blendFlours = (flours, levain) => {
  const { levain: l } = normalizeRecipe({ levain });
  const share = levainFlourContribution(levain).total / 100; // levain flour / total flour
  const shares = levainFlourShares(l.flours);

  const rows = flours.map((f) => ({ type: f.type, overall: parseFloat(f.percentage) || 0 }));
  Object.keys(shares).forEach((type) => {
    if (shares[type] > 0 && !rows.some((r) => r.type === type)) rows.push({ type, overall: 0 });
  });
  rows.forEach((r) => {
    r.levain = 100 * share * (shares[r.type] || 0);
  });

  let raised = 0;
  rows.forEach((r) => {
    if (r.overall < r.levain) {
      raised += r.levain - r.overall;
      r.overall = r.levain;
    }
  });
  const over = Math.min(raised, rows.reduce((sum, r) => sum + r.overall, 0) - 100);
  const slackTotal = rows.reduce((sum, r) => sum + (r.overall - r.levain), 0);
  if (over > 1e-9 && slackTotal > 0) {
    const take = Math.min(over, slackTotal);
    const slack = rows.map((r) => r.overall - r.levain);
    rows.forEach((r, i) => {
      r.overall -= (take * slack[i]) / slackTotal;
    });
  }

  return rows
    .map((r) => ({ ...r, dough: Math.max(0, r.overall - r.levain) }))
    .sort((a, b) => b.overall - a.overall); // largest share first (stable for ties)
};
/**
 * Baker's percentage of flour left for scald and bassinage water once the
 * levain's water is accounted for. Needs no dough weight.
 */
export const levainWaterPercentage = (levain) =>
  (levainFlourContribution(levain).total * levainComposition(levain).hydration) / 100;

export const availableDoughWaterPercentage = (levain, hydration) =>
  parseFloat(hydration) - levainWaterPercentage(levain);

/**
 * The scald as percentages of total flour: { flour, water }. Rye scalds a share of all its
 * flour; a traditional loaf scalds a share of the sifted (fresh-milled) flour. The water is
 * 1x-3x the scald flour. Needs no dough weight.
 */
export const scaldPercentages = (input) => {
  const recipe = normalizeRecipe(input);
  if (!recipe.scald.enabled) return { flour: 0, water: 0 };
  // A rye scald is a share of all the flour. A traditional one is a share of the sifted
  // (fresh-milled) flour, falling back to all the flour when there is none.
  let base = 1;
  if (recipe.breadType !== 'rye') {
    const fresh =
      blendFlours(recipe.flours, recipe.levain)
        .filter((row) => FRESH_MILLED.has(row.type))
        .reduce((sum, row) => sum + row.overall, 0) / 100;
    if (fresh > 0) base = fresh;
  }
  const flour = recipe.scald.flourPercentage * base;
  return { flour, water: flour * recipe.scald.waterMultiplier };
};

/** Soaker water for soaked seeds, as a baker's percentage of flour. Needs no dough weight. */
export const soakWaterPercentage = (inclusions) =>
  normalizeRecipe({ inclusions }).inclusions.reduce(
    (sum, i) => sum + (i.kind === 'seed' && i.soaked ? (i.percentage * i.soakWaterPercentage) / 100 : 0),
    0
  );

/** Water carried by inclusions (honey, egg, puree...), as a baker's percentage of flour. */
export const inclusionWaterPercentage = (inclusions) =>
  normalizeRecipe({ inclusions }).inclusions.reduce((sum, i) => sum + (i.percentage * i.hydration) / 100, 0);

/**
 * Where the water goes, as % of flour. Everything drawn from the dough's total water (levain,
 * scald, bassinage, soaker, water carried by inclusions) has to fit within the hydration;
 * `over` is how far it overshoots (<= 0 when it fits). Needs no dough weight.
 */
export const waterBudget = (input) => {
  const recipe = normalizeRecipe(input);
  const hydration = parseFloat(input.hydration);
  const parts = {
    levain: levainWaterPercentage(recipe.levain),
    scald: scaldPercentages(input).water,
    bassinage: recipe.bassinage.enabled ? recipe.bassinage.percentage : 0,
    soaker: soakWaterPercentage(recipe.inclusions),
    inclusions: inclusionWaterPercentage(recipe.inclusions),
  };
  const used = Object.values(parts).reduce((sum, n) => sum + n, 0);
  return { hydration, parts, used, over: Number.isFinite(hydration) ? used - hydration : 0 };
};

/** Explains a water budget overshoot in plain words, or null when the water fits. */
export const waterBudgetMessage = (budget) => {
  if (budget.over <= 1e-9) return null;
  const round1 = (n) => Math.round(n * 10) / 10;
  const labels = {
    levain: 'levain',
    scald: 'scald',
    bassinage: 'bassinage',
    soaker: 'seed soaker',
    inclusions: 'inclusions',
  };
  const parts = Object.entries(budget.parts)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => `${labels[key]} ${round1(value)}%`)
    .join(', ');
  return (
    `The water adds up to ${round1(budget.used)}% of flour (${parts}), more than your ${round1(budget.hydration)}% hydration. ` +
    `Raise hydration to at least ${Math.ceil(budget.used)}%, or lower the scald flour, water multiplier or other water.`
  );
};

/** The levain is part of the total flour and water, not an add-on. */
export const calculateRecipeFromTotalWeight = (input) => {
  const recipe = normalizeRecipe(input);
  const totalWeightNum = Math.round(parseFloat(recipe.total));
  const hydrationPercentage = parseFloat(recipe.hydration);
  const saltPercentageNum = parseFloat(recipe.saltPercentage);
  const levainPercentage = recipe.levain.percentage;
  const spicePercentage = recipe.spice.enabled ? recipe.spice.percentage : 0;
  const inclusionPercentage = recipe.inclusions.reduce((sum, i) => sum + i.percentage, 0) + spicePercentage;

  // Everything is expressed as a percentage of total flour
  const multiplier = 1 + hydrationPercentage / 100 + saltPercentageNum / 100 + inclusionPercentage / 100;
  const totalFlourWeight = roundWeight(totalWeightNum / multiplier);

  // Levain build: seed / feed flour / feed water by ratio
  // levainPercentage is the prefermented flour: the flour in the levain as % of all flour.
  // The levain's weight follows from how much of it is flour (set by the feeding ratio).
  const fractions = levainFractions(recipe.levain.ratio);
  const levainTotal = roundWeight((totalFlourWeight * levainPercentage) / 100 / fractions.flour);
  const seedWeight = roundWeight(levainTotal * fractions.seed);
  const feedFlourWeight = roundWeight(levainTotal * fractions.feedFlour);
  const feedShares = levainFlourShares(recipe.levain.flours);

  // What the levain contributes to the overall flour and water
  const levainFlourContent = levainTotal * fractions.flour;
  const levainWaterContent = levainTotal * fractions.water;

  const flourWeights = blendFlours(recipe.flours, recipe.levain).map((row) => {
    const weight = roundWeight(totalFlourWeight * (row.overall / 100));
    const levainWeight = Math.min(weight, roundWeight(levainFlourContent * (feedShares[row.type] || 0)));
    return {
      type: row.type,
      percentage: row.overall, // % of all flour, levain's included (what the user enters)
      overallPercentage: row.overall,
      weight,
      levainWeight,
      doughWeight: weight - levainWeight,
    };
  });

  const water = roundWeight((totalFlourWeight * hydrationPercentage) / 100);
  const doughWater = Math.max(0, water - roundWeight(levainWaterContent));

  // Soaker water for soaked seeds comes out of the dough water, then scald, then bassinage
  const inclusions = recipe.inclusions.map((i) => {
    const weight = roundWeight((totalFlourWeight * i.percentage) / 100);
    const soakWater = i.kind === 'seed' && i.soaked ? roundWeight((weight * i.soakWaterPercentage) / 100) : 0;
    const water = roundWeight((weight * i.hydration) / 100); // water carried by the ingredient itself
    return { ...i, weight, soakWater, water };
  });
  const soakWater = Math.min(
    inclusions.reduce((sum, i) => sum + i.soakWater, 0),
    doughWater
  );
  const inclusionWater = Math.min(
    inclusions.reduce((sum, i) => sum + i.water, 0),
    doughWater - soakWater
  );
  const mixWater = doughWater - soakWater - inclusionWater;

  // The scald takes a share of the flour and 1x-3x that weight in hot water
  const scaldShare = scaldPercentages(recipe);
  const doughFlourTotal = flourWeights.reduce((sum, f) => sum + f.doughWeight, 0);
  const scaldFlour = recipe.scald.enabled
    ? Math.min(roundWeight((totalFlourWeight * scaldShare.flour) / 100), doughFlourTotal)
    : 0;
  const scaldWater = recipe.scald.enabled
    ? Math.min(roundWeight(scaldFlour * recipe.scald.waterMultiplier), mixWater)
    : 0;

  // Split the scald flour across the flours it draws from, so the recipe can list the scald,
  // and the rest of each flour as main dough, separately
  const scaldKind = scaldKinds(recipe.breadType);
  const candidates = flourWeights.filter((f) => f.doughWeight > 0);
  const preferred = candidates.filter((f) => scaldKind.has(f.type));
  const pool = preferred.length ? preferred : candidates;
  const poolTotal = pool.reduce((sum, f) => sum + f.doughWeight, 0);
  const scaldShares = new Map();
  let left = scaldFlour;
  pool.forEach((f, index) => {
    const share = index === pool.length - 1 ? left : roundWeight((scaldFlour * f.doughWeight) / poolTotal);
    const taken = Math.min(f.doughWeight, Math.max(0, Math.min(share, left)));
    scaldShares.set(f.type, taken);
    left -= taken;
  });
  // anything the pool couldn't cover (capped by its own weight) spills to the other flours
  candidates
    .filter((f) => !pool.includes(f))
    .forEach((f) => {
      const taken = Math.min(f.doughWeight, left);
      scaldShares.set(f.type, taken);
      left -= taken;
    });
  const flourDetails = flourWeights.map((f) => {
    const scaldWeight = scaldShares.get(f.type) || 0;
    return { ...f, scaldWeight, mainWeight: f.doughWeight - scaldWeight };
  });

  const bassinageWater = recipe.bassinage.enabled
    ? Math.min(roundWeight((totalFlourWeight * recipe.bassinage.percentage) / 100), mixWater - scaldWater)
    : 0;

  // Brotgewürz amounts are small, so weights keep one decimal
  const round1 = (n) => Math.round(n * 10) / 10;
  const spiceTotal = (totalFlourWeight * spicePercentage) / 100;
  const ratioSum = Object.values(recipe.spice.ratios).reduce((sum, r) => sum + r, 0);
  const spice = {
    enabled: recipe.spice.enabled,
    use: recipe.spice.use,
    percentage: recipe.spice.percentage,
    ratios: recipe.spice.ratios,
    total: round1(spiceTotal),
    blend: Object.entries(recipe.spice.ratios)
      .filter(([, ratio]) => ratio > 0)
      .map(([type, ratio]) => ({ type, ratio, weight: round1((spiceTotal * ratio) / ratioSum) })),
  };
  const composition = levainComposition(recipe.levain);

  const result = {
    breadType: recipe.breadType,
    method: recipe.method,
    flours: flourDetails,
    water,
    doughWater,
    levain: {
      percentage: levainPercentage,
      ratio: recipe.levain.ratio,
      total: levainTotal,
      seed: seedWeight,
      flour: feedFlourWeight,
      water: levainTotal - seedWeight - feedFlourWeight,
      flourContent: roundWeight(levainFlourContent),
      flourPercentage: levainPercentage,
      weightPercentage: (levainPercentage / fractions.flour),
      flourFraction: composition.flourPercentage,
      hydration: composition.hydration,
      flours: [...recipe.levain.flours]
        .sort((a, b) => b.percentage - a.percentage)
        .map((f) => ({
        type: f.type,
        percentage: f.percentage,
        weight: roundWeight(feedFlourWeight * (feedShares[f.type] || 0)),
      })),
    },
    salt: roundWeight((totalFlourWeight * saltPercentageNum) / 100),
    scald: {
      enabled: recipe.scald.enabled,
      flourPercentage: recipe.scald.flourPercentage,
      waterMultiplier: recipe.scald.waterMultiplier,
      flour: scaldFlour,
      water: scaldWater,
    },
    bassinage: { enabled: recipe.bassinage.enabled, percentage: recipe.bassinage.percentage, water: bassinageWater },
    soakWater,
    inclusionWater,
    waterToAdd: mixWater - scaldWater - bassinageWater,
    sifting: recipe.sifting,
    mixing: recipe.mixing,
    bake: recipe.bake,
    temps: recipe.temps,
    inclusions,
    spice,
    flourWeight: totalFlourWeight,
    saltPercentage: saltPercentageNum,
    hydration: hydrationPercentage,
    total: totalWeightNum,
  };

  if (recipe.name) result.name = recipe.name;
  return result;
};
