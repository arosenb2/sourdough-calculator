import { useState } from 'react';
import { format } from 'timeago.js';
import PrintableRecipe from './PrintableRecipe';
import useRecipeStore from '../stores/recipeStore';
import { ChevronDownIcon, ChevronUpIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function SavedRecipes() {
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const deleteRecipe = useRecipeStore((state) => state.deleteRecipe);
  const updateRecipeName = useRecipeStore((state) => state.updateRecipeName);
  const recipes = useRecipeStore((state) => state.savedRecipes);

  const handleDelete = (recipeId) => {
    if (confirm('Are you sure you want to delete this recipe?')) {
      deleteRecipe(recipeId);
      setExpandedId(null);
    }
  };

  const handleEdit = (recipe) => {
    setEditingId(recipe.id);
    setEditName(recipe.name || `${recipe.total}g ${recipe.hydration}% Hydration Sourdough`);
  };

  const handleSave = (recipeId) => {
    updateRecipeName(recipeId, editName);
    setEditingId(null);
  };

  if (recipes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">No saved recipes yet.</p>
      </div>
    );
  }

  return (
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
                    {recipe.name || `${recipe.total}g ${recipe.hydration}% Hydration Sourdough`}
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
                  {recipe.flours.map(f => f.type).join(', ')} · {recipe.hydration}% Hydration · {recipe.total}g
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
  );
}