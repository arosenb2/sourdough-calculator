import { FLOUR_TYPES } from '../types/recipe';

export const formatFloursForUrl = (flours) => {
  return flours
    .map(flour => {
      const key = Object.entries(FLOUR_TYPES)
        .find(([k, _]) => k === flour.type)[0];
      return `${key}:${flour.percentage}`;
    })
    .join(',');
};

export const parseFloursFromUrl = (flourParam) => {
  return flourParam.split(',').map(flour => {
    const [key, percentage] = flour.split(':');
    return {
      type: FLOUR_TYPES[key],
      percentage: parseFloat(percentage)
    };
  });
};