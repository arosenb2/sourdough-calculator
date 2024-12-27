import { useState } from 'react';
import { format } from 'timeago.js';
import PrintableRecipe from './PrintableRecipe';
import useRecipeStore from '../stores/recipeStore';
import { formatWeight } from '../utils/formatting';
import { ChevronDownIcon, ChevronUpIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function SavedRecipes() {
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const deleteRecipe = useRecipeStore((state) => state.deleteRecipe);
  const updateRecipeName = useRecipeStore((state) => state.updateRecipeName);
  const recipes = useRecipeStore((state) => state.savedRecipes) || [];
  const clearSavedRecipes = useRecipeStore((state) => state.clearSavedRecipes);

  const handleDelete = (recipeId) => {
    if (confirm('Are you sure you want to delete this recipe?')) {
      deleteRecipe(recipeId);
      setExpandedId(null);
    }
  };

  const handleEdit = (recipe) => {
    setEditingId(recipe.id);
    setEditName(recipe.name || `${formatWeight(recipe.total)} ${recipe.hydration}% Hydration Sourdough`);
  };

  const handleSave = (recipeId) => {
    updateRecipeName(recipeId, editName);
    setEditingId(null);
  };

  const handleClearAll = () => {
    setShowConfirmDialog(false);
    clearSavedRecipes();
  };

  if (!recipes?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">No saved recipes yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowConfirmDialog(true)}
          className="text-red-600 hover:text-red-800 dark:text-red-400
                     flex items-center gap-1 text-sm px-3 py-1 rounded-md
                     border border-red-200 hover:border-red-300
                     dark:border-red-800 dark:hover:border-red-700"
        >
          Delete All Recipes
        </button>
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              Delete All Recipes?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800
                           dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-600 text-white rounded-md
                           hover:bg-red-700"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {editingId === recipe.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="p-1 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSave(recipe.id)}
                      className="text-green-600 hover:text-green-700 dark:text-green-400"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-gray-600 hover:text-gray-700 dark:text-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold dark:text-white">
                      {recipe.name || `${formatWeight(recipe.total)} ${recipe.hydration}% Hydration Sourdough`}
                    </h3>
                    <button
                      onClick={() => handleEdit(recipe)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <PencilIcon className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400" />
                    </button>
                  </div>
                )}
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>Added {format(recipe.createdAt)}</p>
                  <p>
                    {recipe.flours.map(f => f.type).join(', ')} · {recipe.hydration}% Hydration · {formatWeight(recipe.total)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)}
                className="p-1.5 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {expandedId === recipe.id ? (
                  <ChevronUpIcon className="h-5 w-5" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {expandedId === recipe.id && (
              <div className="mt-4 border-t pt-4 dark:border-gray-700">
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 flex items-center gap-1 text-sm"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete Recipe
                  </button>
                </div>
                <PrintableRecipe recipe={recipe} hideActions />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}