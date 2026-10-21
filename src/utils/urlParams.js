import { FLOUR_TYPES } from '../types/recipe';

export const parseFloursFromUrl = (flourParam) => {
  if (!flourParam) return [];

  return flourParam.split(',').map(flour => {
    const [key, percentage] = flour.split(':');
    return {
      type: key, // Use the key (BF, WW, etc.) directly
      percentage: parseFloat(percentage)
    };
  });
};

export const formatFloursForUrl = (flours) => {
  return flours
    .map(flour => `${flour.type}:${flour.percentage}`)
    .join(',');
};
// Process settings (levain, scald, etc.) travel as one JSON param to keep links compact.
export const formatProcessForUrl = (recipe) =>
  JSON.stringify({
    breadType: recipe.breadType,
    method: recipe.method,
    levain: {
      percentage: recipe.levain.percentage,
      ratio: recipe.levain.ratio,
      flours: recipe.levain.flours.map(({ type, percentage }) => ({ type, percentage })),
    },
    scald: {
      enabled: recipe.scald.enabled,
      flourPercentage: recipe.scald.flourPercentage,
      waterMultiplier: recipe.scald.waterMultiplier,
    },
    bassinage: recipe.bassinage,
    sifting: recipe.sifting,
    mixing: recipe.mixing,
    bake: recipe.bake,
    temps: recipe.temps,
    inclusions: recipe.inclusions.map(({ kind, name, percentage, hydration, soaked, soakWaterPercentage }) => ({
      kind,
      name,
      percentage,
      hydration,
      soaked,
      soakWaterPercentage,
    })),
    spice: {
      enabled: recipe.spice.enabled,
      percentage: recipe.spice.percentage,
      use: recipe.spice.use,
      ratios: recipe.spice.ratios,
    },
  });

export const parseProcessFromUrl = (param) => {
  if (!param) return {};
  try {
    const parsed = JSON.parse(param);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};
