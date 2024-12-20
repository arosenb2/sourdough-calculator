// Constants
const LEVAIN_PERCENTAGE = 20; // 20% of flour weight

export const calculateRecipeFromTotalWeight = ({ totalWeight, hydration, salt }) => {
  const totalWeightNum = parseFloat(totalWeight);
  const hydrationPercentage = parseFloat(hydration);
  const saltPercentage = parseFloat(salt);

  // Calculate multiplier based on baker's percentages (relative to flour weight)
  const multiplier = 1 + hydrationPercentage/100 + LEVAIN_PERCENTAGE/100 + saltPercentage/100;
  const flourWeight = Math.round(totalWeightNum / multiplier);

  // Calculate ingredients based on flour weight
  return {
    flour: flourWeight,
    water: Math.round((flourWeight * hydrationPercentage) / 100),
    levain: Math.round((flourWeight * LEVAIN_PERCENTAGE) / 100),
    salt: Math.round((flourWeight * saltPercentage) / 100),
    saltPercentage,
    hydration: hydrationPercentage,
    total: totalWeightNum
  };
};