export const LEVAIN_PERCENTAGE = 20; // 20% of flour weight

export const roundWeight = (weight) => {
  return Math.round(weight);
};

export const calculateRecipeFromTotalWeight = ({ total, hydration, saltPercentage, flours }) => {
  const totalWeightNum = Math.round(parseFloat(total));
  const hydrationPercentage = parseFloat(hydration);
  const saltPercentageNum = parseFloat(saltPercentage);

  // Calculate total multiplier including levain
  const multiplier = 1 + (hydrationPercentage/100) + (LEVAIN_PERCENTAGE/100) + (saltPercentageNum/100);
  const totalFlourWeight = roundWeight(totalWeightNum / multiplier);

  // Calculate individual component weights
  const flourWeights = flours.map(flour => ({
    type: flour.type,
    percentage: flour.percentage,
    weight: roundWeight(totalFlourWeight * (flour.percentage / 100))
  }));

  return {
    flours: flourWeights,
    water: roundWeight((totalFlourWeight * hydrationPercentage) / 100),
    levain: roundWeight((totalFlourWeight * LEVAIN_PERCENTAGE) / 100),
    salt: roundWeight((totalFlourWeight * saltPercentageNum) / 100),
    flourWeight: totalFlourWeight,
    saltPercentage: saltPercentageNum,
    hydration: hydrationPercentage,
    total: totalWeightNum
  };
};