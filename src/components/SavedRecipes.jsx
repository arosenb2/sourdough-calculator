import { getSavedRecipes } from '../utils/storage';
import PrintableRecipe from './PrintableRecipe';

export default function SavedRecipes() {
  const recipes = getSavedRecipes();

  if (recipes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">No saved recipes yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {recipes.map((recipe) => (
        <div key={recipe.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold dark:text-white">
                {recipe.total}g Sourdough
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(recipe.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <PrintableRecipe recipe={recipe} />
        </div>
      ))}
    </div>
  );
}