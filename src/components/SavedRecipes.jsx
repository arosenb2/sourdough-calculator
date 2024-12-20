import { format } from 'timeago.js';
import { getSavedRecipes } from '../utils/storage';
import PrintableRecipe from './PrintableRecipe';

export default function SavedRecipes() {
  const deleteRecipe = useRecipeStore((state) => state.deleteRecipe);
  const recipes = getSavedRecipes();

  const handleDelete = (recipeId) => {
    if (confirm('Are you sure you want to delete this recipe?')) {
      deleteRecipe(recipeId);
    }
  };

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
              <div>
                <h3 className="text-xl font-semibold dark:text-white">
                  {recipe.name || `${recipe.total}g ${recipe.hydration}% Hydration Sourdough`}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {recipe.total}g · {recipe.hydration}% Hydration
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {format(recipe.createdAt)}
                </span>
                <button
                  onClick={() => handleDelete(recipe.id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <PrintableRecipe recipe={recipe} />
        </div>
      ))}
    </div>
  );
}