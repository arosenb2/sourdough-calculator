export const validateSaltPercentage = (value) => {
  const saltPercentage = parseFloat(value);
  return saltPercentage >= 1.5 && saltPercentage <= 3;
};