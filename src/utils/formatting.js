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