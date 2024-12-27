import React from 'react';
import { formatPercentage, formatWeight } from '../../utils/formatting';
import { FLOUR_TYPES } from '../../types/recipe';

export default function RecipeDetails({ recipe }) {
  const totalPercentage = Number(
    recipe.flours.reduce((sum, flour) => sum + (Number(flour.percentage) || 0), 0) +
    (Number(recipe.hydration) || 0) +
    (Number(recipe.levain) / Number(recipe.flour) * 100 || 0) +
    (Number(recipe.saltPercentage) || 0)
  );

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Recipe Details</h2>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="border-b border-gray-200 dark:border-gray-600 font-semibold text-gray-600 dark:text-gray-300">Component</div>
            <div className="border-b border-gray-200 dark:border-gray-600 font-semibold text-right text-gray-600 dark:text-gray-300">Weight</div>
            <div className="border-b border-gray-200 dark:border-gray-600 font-semibold text-right text-gray-600 dark:text-gray-300">Baker's %</div>

            {recipe.flours.map((flour, index) => (
              <React.Fragment key={index}>
                <div className="text-gray-800 dark:text-gray-200">{FLOUR_TYPES[flour.type]}</div>
                <div className="text-right text-gray-800 dark:text-gray-200">
                  {formatWeight(recipe.flourWeight * flour.percentage / 100)}
                </div>
                <div className="text-right text-gray-800 dark:text-gray-200">
                  {formatPercentage(flour.percentage)}%
                </div>
              </React.Fragment>
            ))}

            <div className="text-gray-800 dark:text-gray-200">Water</div>
            <div className="text-right text-gray-800 dark:text-gray-200">{formatWeight(recipe.water)}</div>
            <div className="text-right text-gray-800 dark:text-gray-200">
              {formatPercentage(recipe.hydration)}%
            </div>

            <div className="text-gray-800 dark:text-gray-200">Levain</div>
            <div className="text-right text-gray-800 dark:text-gray-200">{formatWeight(recipe.levain)}</div>
            <div className="text-right text-gray-800 dark:text-gray-200">
              {formatPercentage(recipe.levain / recipe.flourWeight * 100)}%
            </div>

            <div className="text-gray-800 dark:text-gray-200">Salt</div>
            <div className="text-right text-gray-800 dark:text-gray-200">{formatWeight(recipe.salt)}</div>
            <div className="text-right text-gray-800 dark:text-gray-200">
              {formatPercentage(recipe.saltPercentage)}%
            </div>

            <div className="font-semibold border-t border-gray-200 dark:border-gray-600 pt-2 text-gray-800 dark:text-white">
              Total
            </div>
            <div className="font-semibold border-t border-gray-200 dark:border-gray-600 pt-2 text-right text-gray-800 dark:text-white">
              {recipe.total}g
            </div>
            <div className="font-semibold border-t border-gray-200 dark:border-gray-600 pt-2 text-right text-gray-800 dark:text-white">
              {formatPercentage(totalPercentage)}%
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}