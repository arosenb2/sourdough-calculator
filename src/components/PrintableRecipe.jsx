import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import useRecipeStore from '../stores/recipeStore';
import {
  PlusIcon,
  PrinterIcon,
  BookmarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

export default function PrintableRecipe({ recipe }) {
  const navigate = useNavigate();
  const saveRecipe = useRecipeStore(state => state.saveRecipe);
  const [saved, setSaved] = useState(false);

  const formatPercentage = (value) => Number(value).toFixed(1);

  const title = recipe.name || `${formatPercentage(recipe.hydration)}% Hydration Sourdough (${recipe.total}g)`;

  const handleSave = () => {
    saveRecipe(recipe);
    setSaved(true);
  };

  if (!recipe || !recipe.flours) {
    return <Navigate to="/" replace />;
  }

  const totalPercentage = Number(
    recipe.flours.reduce((sum, flour) => sum + (Number(flour.percentage) || 0), 0) +
    (Number(recipe.hydration) || 0) +
    (Number(recipe.levain) / Number(recipe.flour) * 100 || 0) +
    (Number(recipe.saltPercentage) || 0)
  );

  return (
    <div className="print:p-8 print-only">
      <div className="max-w-2xl mx-auto">
        <div className="print:hidden mb-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            New Recipe
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saved}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              {saved ? (
                <>
                  <CheckIcon className="h-5 w-5" />
                  Saved!
                </>
              ) : (
                <>
                  <BookmarkIcon className="h-5 w-5" />
                  Save Recipe
                </>
              )}
            </button>
            <button
              onClick={() => window.print()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <PrinterIcon className="h-5 w-5" />
              Print Recipe
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 print:shadow-none print-only">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            {title}
          </h1>

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
                      <div className="text-gray-800 dark:text-gray-200">{flour.type}</div>
                      <div className="text-right text-gray-800 dark:text-gray-200">
                        {Math.round(recipe.flour * flour.percentage / 100)}g
                      </div>
                      <div className="text-right text-gray-800 dark:text-gray-200">
                        {formatPercentage(flour.percentage)}%
                      </div>
                    </React.Fragment>
                  ))}

                  <div className="text-gray-800 dark:text-gray-200">Water</div>
                  <div className="text-right text-gray-800 dark:text-gray-200">{recipe.water}g</div>
                  <div className="text-right text-gray-800 dark:text-gray-200">
                    {formatPercentage(recipe.hydration)}%
                  </div>

                  <div className="text-gray-800 dark:text-gray-200">Levain</div>
                  <div className="text-right text-gray-800 dark:text-gray-200">{recipe.levain}g</div>
                  <div className="text-right text-gray-800 dark:text-gray-200">
                    {formatPercentage(recipe.levain / recipe.flour * 100)}%
                  </div>

                  <div className="text-gray-800 dark:text-gray-200">Salt</div>
                  <div className="text-right text-gray-800 dark:text-gray-200">{recipe.salt}g</div>
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
        </div>
      </div>
    </div>
  );
}