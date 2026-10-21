export const formatWeight = (weight) => {
  return `${weight.toLocaleString()}g`;
};

export function formatPercentage(value) {
  if (typeof value !== 'number') {
    value = parseFloat(value);
  }
  if (isNaN(value)) return '0';
  return Number.isInteger(value) ? value.toString() : value.toFixed(1).replace(/\.0$/, '');
}

/** Name used when a recipe has none. Weight is left out: it's chosen each time the recipe is used. */
export function defaultRecipeName(recipe) {
  return `${formatPercentage(recipe.hydration)}% Hydration ${recipe.breadType === 'rye' ? 'Rye' : 'Sourdough'}`;
}
