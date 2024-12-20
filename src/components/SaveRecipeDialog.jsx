import React, { useState } from 'react';

export default function SaveRecipeDialog({ recipe, onSave, onCancel }) {
  const defaultName = `${recipe.total}g ${recipe.hydration}% Hydration Sourdough`;
  const [name, setName] = useState(defaultName);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
        <h3 className="text-lg font-semibold mb-4">Save Recipe</h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2">Cancel</button>
          <button
            onClick={() => onSave(name)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}