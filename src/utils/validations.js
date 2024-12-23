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
  return !isNaN(value) && value >= 50 && value <= 100;
};