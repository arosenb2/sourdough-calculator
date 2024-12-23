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