export const LEVAIN_PERCENTAGE = 20; // 20% of flour weight

export const calculateRecipeFromTotalWeight = ({ total, hydration, saltPercentage, flours }) => {
  const totalWeightNum = parseFloat(total);
  const hydrationPercentage = parseFloat(hydration);
  const saltPercentageNum = parseFloat(saltPercentage);

  // Calculate total multiplier including levain
  const multiplier = 1 + (hydrationPercentage/100) + (LEVAIN_PERCENTAGE/100) + (saltPercentageNum/100);
  const totalFlourWeight = Math.round(totalWeightNum / multiplier);

  // Calculate individual component weights
  const flourWeights = flours.map(flour => ({
    type: flour.type,
    percentage: flour.percentage,
    weight: Math.round(totalFlourWeight * (flour.percentage / 100))
  }));

  return {
    flours: flourWeights,
    water: Math.round((totalFlourWeight * hydrationPercentage) / 100),
    levain: Math.round((totalFlourWeight * LEVAIN_PERCENTAGE) / 100),
    levainPercentage: LEVAIN_PERCENTAGE,
    salt: Math.round((totalFlourWeight * saltPercentageNum) / 100),
    flourWeight: totalFlourWeight,
    saltPercentage: saltPercentageNum,
    hydration: hydrationPercentage,
    total: totalWeightNum
  };
};