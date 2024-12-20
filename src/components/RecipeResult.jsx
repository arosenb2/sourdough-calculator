import { useState } from 'react';
import PrintableRecipe from './PrintableRecipe';
import { saveRecipe } from '../utils/storage';

export default function RecipeResult({ recipe }) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveRecipe(recipe);
    setSaved(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6 print:shadow-none">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">Your Recipe</h2>
          <div className="space-x-4">
            <button
              onClick={handleSave}
              disabled={saved}
              className="text-indigo-600 hover:text-indigo-800 disabled:text-gray-400"
            >
              {saved ? 'Saved!' : 'Save Recipe'}
            </button>
            <button
              onClick={handlePrint}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Print Recipe
            </button>
          </div>
        </div>

        <PrintableRecipe recipe={recipe} />
      </div>
    </div>
  );
}