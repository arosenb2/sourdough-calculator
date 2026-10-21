import {
  BAKE_VESSELS,
  findKnownInclusion,
  DEFAULT_SCALD_FLOUR_PERCENTAGE,
  DEFAULT_SCALD_MULTIPLIER,
  RYE_DEFAULTS,
  scaldMultipliersFor,
  DEFAULT_SOAK_WATER_PERCENTAGE,
  DEFAULT_SPICE_PERCENTAGE,
  DEFAULT_SPICE_RATIOS,
  INCLUSION_KINDS,
  MAX_BAKE_STAGES,
  FLOUR_TYPES,
  DEFAULT_LEVAIN_PERCENTAGE,
  DEFAULT_LEVAIN_RATIO,
  DEFAULT_SIFT_EXTRACTION,
} from '../types/recipe';

const MAX_INCLUSIONS = 20;

const num = (value, fallback) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
};

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const normalizeFlours = (flours) => {
  const valid = Array.isArray(flours)
    ? flours
        .filter((f) => f && FLOUR_TYPES[f.type])
        .map((f) => ({ type: f.type, percentage: clamp(num(f.percentage, 0), 0, 100) }))
    : [];
  return valid.length ? valid : [{ type: 'BF', percentage: 100 }];
};

// Feeding ratios are whole numbers (1:5:5, 1:10:10...), so anything else is rounded
const normalizeRatio = (ratio, breadType) => {
  const parts = ['seed', 'flour', 'water'].map((k) => Math.round(num(ratio?.[k], 0)));
  if (parts.some((p) => p <= 0)) return { ...(breadType === 'rye' ? RYE_DEFAULTS.levainRatio : DEFAULT_LEVAIN_RATIO) };
  return { seed: parts[0], flour: parts[1], water: parts[2] };
};

// Blank means zero folds; a missing value falls back to the default
const normalizeCount = (value, fallback) => {
  if (value === '') return 0;
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? clamp(n, 0, 20) : fallback;
};

/** Starting bake for a bread type; rye usually bakes in a pan, everything else in a Dutch oven. */
export const defaultBake = (breadType = 'traditional', vessel) => {
  const chosen = BAKE_VESSELS[vessel] ? vessel : breadType === 'rye' ? 'pan' : 'dutch';
  const first = chosen === 'dutch' ? 'covered' : 'steamed';
  const stages =
    breadType === 'rye'
      ? [{ mode: first, temp: 450, minutes: 15 }, { mode: 'dry', temp: 450, minutes: 40 }]
      : [{ mode: first, temp: 475, minutes: 20 }, { mode: 'dry', temp: 450, minutes: 25 }];
  return { vessel: chosen, stages };
};

const normalizeBake = (bake, breadType) => {
  const vessel = BAKE_VESSELS[bake?.vessel] ? bake.vessel : defaultBake(breadType).vessel;
  const modes = BAKE_VESSELS[vessel].modes;
  const stages =
    Array.isArray(bake?.stages) && bake.stages.length
      ? bake.stages.slice(0, MAX_BAKE_STAGES).map((stage) => ({
          mode: modes[stage?.mode] ? stage.mode : 'dry',
          temp: clamp(num(stage?.temp, 450), 200, 600),
          minutes: clamp(num(stage?.minutes, 20), 1, 300),
        }))
      : defaultBake(breadType, vessel).stages;
  return { vessel, stages };
};

const normalizeSpice = (spice) => {
  const keys = Object.keys(DEFAULT_SPICE_RATIOS);
  const given = spice?.ratios && typeof spice.ratios === 'object' ? spice.ratios : null;
  let ratios = Object.fromEntries(
    keys.map((key) => [key, given ? clamp(num(given[key], 0), 0, 100) : DEFAULT_SPICE_RATIOS[key]])
  );
  if (Object.values(ratios).every((r) => r === 0)) ratios = { ...DEFAULT_SPICE_RATIOS };
  return {
    enabled: Boolean(spice?.enabled),
    percentage: clamp(num(spice?.percentage, DEFAULT_SPICE_PERCENTAGE), 0, 10),
    use: spice?.use === 'coat' ? 'coat' : 'mix',
    ratios,
  };
};

const normalizeInclusion = (item) => {
  const kind = INCLUSION_KINDS.includes(item?.kind) ? item.kind : 'other';
  const name = String(item?.name ?? '').trim().slice(0, 60);
  return {
    kind,
    name,
    percentage: clamp(num(item?.percentage, 0), 0, 100),
    // % of the item's weight that is water. Seeds are dry (their soak water is separate), a known
    // ingredient always uses its built-in value, and only a custom one takes a value entered by hand.
    hydration:
      kind === 'seed'
        ? 0
        : findKnownInclusion(name)
          ? findKnownInclusion(name).hydration
          : clamp(num(item?.hydration, 0), 0, 100),
    ...(kind === 'seed'
      ? {
          soaked: Boolean(item?.soaked),
          soakWaterPercentage: clamp(num(item?.soakWaterPercentage, DEFAULT_SOAK_WATER_PERCENTAGE), 0, 500),
        }
      : {}),
  };
};

const normalizeTemp = (value) => {
  const n = num(value, null);
  return n === null ? null : clamp(n, 32, 212);
};

/**
 * Fills in and sanitizes the process-related fields of a recipe. Recipes saved
 * before these fields existed, shared links, and wizard state (where numbers
 * are still strings) all go through here.
 */
export const normalizeRecipe = (raw = {}) => {
  const breadType = raw.breadType === 'rye' ? 'rye' : 'traditional';

  let method = 'mix';
  if (breadType === 'traditional') {
    method = raw.method === 'fermentolyse' ? 'fermentolyse' : 'autolyse';
  }

  const scaldEnabled = Boolean(raw.scald?.enabled);
  const levain = raw.levain && typeof raw.levain === 'object' ? raw.levain : {};
  const levainFlours = normalizeFlours(
    levain.flours?.length ? levain.flours : [{ type: breadType === 'rye' ? 'RY' : 'BF', percentage: 100 }]
  );

  const inclusions = Array.isArray(raw.inclusions)
    ? raw.inclusions
        .slice(0, MAX_INCLUSIONS)
        .map(normalizeInclusion)
        .filter((i) => i.name && i.percentage > 0)
    : [];

  return {
    ...raw,
    breadType,
    method,
    levain: {
      percentage: clamp(
        num(levain.percentage, breadType === 'rye' ? RYE_DEFAULTS.levainPercentage : DEFAULT_LEVAIN_PERCENTAGE),
        0,
        100
      ),
      ratio: normalizeRatio(levain.ratio, breadType),
      flours: levainFlours,
    },
    // Scald and bassinage are baker's percentages of flour, so the formula doesn't depend on dough weight
    scald: {
      enabled: scaldEnabled,
      // % of the sifted flour (traditional) or of all flour (rye) that gets scalded
      flourPercentage: clamp(
        num(raw.scald?.flourPercentage, breadType === 'rye' ? RYE_DEFAULTS.scaldFlourPercentage : DEFAULT_SCALD_FLOUR_PERCENTAGE),
        0,
        100
      ),
      waterMultiplier: scaldMultipliersFor(breadType).includes(num(raw.scald?.waterMultiplier, 0))
        ? num(raw.scald.waterMultiplier, 0)
        : DEFAULT_SCALD_MULTIPLIER,
    },
    bassinage: {
      enabled: Boolean(raw.bassinage?.enabled),
      percentage: clamp(num(raw.bassinage?.percentage, 0), 0, 100),
    },
    sifting: {
      // A traditional scald uses the bran sifted out of the flour, so it requires sifting
      enabled: Boolean(raw.sifting?.enabled) || (breadType === 'traditional' && scaldEnabled),
      extraction: clamp(num(raw.sifting?.extraction, DEFAULT_SIFT_EXTRACTION), 50, 100),
    },
    bake: normalizeBake(raw.bake, breadType),
    mixing: {
      type: raw.mixing?.type === 'stand' ? 'stand' : 'hand',
      stretchFolds: normalizeCount(raw.mixing?.stretchFolds, 4),
      coilFolds: normalizeCount(raw.mixing?.coilFolds, 0),
    },
    temps: {
      levain: normalizeTemp(raw.temps?.levain),
      dough: normalizeTemp(raw.temps?.dough),
      scald: normalizeTemp(raw.temps?.scald),
    },
    inclusions,
    spice: normalizeSpice(raw.spice),
  };
};

/** Starting values for a new recipe in the calculator wizard. */
export const defaultWizardData = () => ({
  breadType: 'traditional',
  totalWeight: '',
  flours: [{ type: 'BF', percentage: 100 }],
  hydration: '',
  salt: '',
  levain: {
    percentage: DEFAULT_LEVAIN_PERCENTAGE,
    ratio: { ...DEFAULT_LEVAIN_RATIO },
    flours: [{ type: 'BF', percentage: 100 }],
  },
  scald: { enabled: false, flourPercentage: DEFAULT_SCALD_FLOUR_PERCENTAGE, waterMultiplier: DEFAULT_SCALD_MULTIPLIER },
  bassinage: { enabled: false, percentage: '' },
  sifting: { enabled: false, extraction: DEFAULT_SIFT_EXTRACTION },
  method: 'autolyse',
  mixing: { type: 'hand', stretchFolds: 4, coilFolds: 0 },
  bake: defaultBake('traditional'),
  temps: { levain: '', dough: '', scald: '' },
  inclusions: [],
  spice: { enabled: false, percentage: DEFAULT_SPICE_PERCENTAGE, use: 'mix', ratios: { ...DEFAULT_SPICE_RATIOS } },
});

/** The recipe without a dough weight: what gets saved, since weight is asked for each time. */
export const toFormula = (raw) => {
  // eslint-disable-next-line no-unused-vars
  const { total, ...formula } = normalizeRecipe(raw);
  return formula;
};

/**
 * Wizard values that depend on the bread type. Rye starts with a bigger levain, wetter
 * dough and a scald; traditional bread starts with the plain defaults.
 */
export const typeDefaults = (breadType) => {
  const scald = {
    enabled: breadType === 'rye',
    flourPercentage: breadType === 'rye' ? RYE_DEFAULTS.scaldFlourPercentage : DEFAULT_SCALD_FLOUR_PERCENTAGE,
    waterMultiplier: DEFAULT_SCALD_MULTIPLIER,
  };
  return breadType === 'rye'
    ? {
        hydration: String(RYE_DEFAULTS.hydration),
        salt: String(RYE_DEFAULTS.salt),
        levainPercentage: RYE_DEFAULTS.levainPercentage,
        levainRatio: { ...RYE_DEFAULTS.levainRatio },
        flours: RYE_DEFAULTS.flours.map((f) => ({ ...f })),
        scald,
      }
    : {
        hydration: '',
        salt: '',
        levainPercentage: DEFAULT_LEVAIN_PERCENTAGE,
        levainRatio: { ...DEFAULT_LEVAIN_RATIO },
        flours: [{ type: 'BF', percentage: 100 }],
        scald,
      };
};

/**
 * Adds any flour the levain uses that isn't in the blend yet, at its minimum (the share the
 * levain already holds), and trims the flours with room to keep the total at 100%.
 * `byType` is levainFlourContribution(levain).byType.
 */
export const withLevainFlours = (flours, byType) => {
  const minimum = (type) => Math.ceil((byType[type] || 0) * 10) / 10;
  const missing = Object.keys(byType).filter((type) => byType[type] > 0 && !flours.some((f) => f.type === type));
  if (!missing.length) return flours;

  const next = [...flours, ...missing.map((type) => ({ type, percentage: minimum(type) }))];
  let over = next.reduce((sum, f) => sum + (Number(f.percentage) || 0), 0) - 100;
  const roomy = next
    .map((f, index) => ({ index, room: (Number(f.percentage) || 0) - minimum(f.type) }))
    .filter((item) => item.room > 0)
    .sort((a, b) => b.room - a.room);
  for (const { index, room } of roomy) {
    if (over <= 0) break;
    const cut = Math.min(room, over);
    next[index] = { ...next[index], percentage: Math.round(((Number(next[index].percentage) || 0) - cut) * 10) / 10 };
    over -= cut;
  }
  return next;
};

/** The wizard's form state as a recipe (the shape the calculation and saving use). */
export const wizardDataToRecipe = (data) => ({
  breadType: data.breadType,
  total: parseFloat(data.totalWeight),
  hydration: parseFloat(data.hydration),
  saltPercentage: parseFloat(data.salt),
  flours: data.flours.map((f) => ({ type: f.type, percentage: parseFloat(f.percentage) || 0 })),
  levain: data.levain,
  scald: data.scald,
  bassinage: data.bassinage,
  sifting: data.sifting,
  method: data.method,
  mixing: data.mixing,
  bake: data.bake,
  temps: data.temps,
  inclusions: data.inclusions,
  spice: data.spice,
});

/** A saved recipe as wizard form state, so it can be edited step by step. No dough weight: that's picked on use. */
export const wizardDataFromRecipe = (raw) => {
  const r = normalizeRecipe(raw);
  const blank = (value) => (value === null || value === undefined ? '' : value);
  const flours = Array.isArray(raw.flours) && raw.flours.length ? raw.flours : r.flours;
  return {
    breadType: r.breadType,
    totalWeight: '',
    flours: flours.map((f) => ({ type: f.type, percentage: f.percentage })),
    hydration: blank(raw.hydration),
    salt: blank(raw.saltPercentage),
    levain: {
      percentage: r.levain.percentage,
      ratio: { ...r.levain.ratio },
      flours: r.levain.flours.map((f) => ({ ...f })),
    },
    scald: { ...r.scald },
    bassinage: { ...r.bassinage },
    sifting: { ...r.sifting },
    method: r.method,
    mixing: { ...r.mixing },
    bake: { vessel: r.bake.vessel, stages: r.bake.stages.map((stage) => ({ ...stage })) },
    temps: { levain: blank(r.temps.levain), dough: blank(r.temps.dough), scald: blank(r.temps.scald) },
    inclusions: r.inclusions.map((item) => ({ ...item })),
    spice: { ...r.spice, ratios: { ...r.spice.ratios } },
  };
};
