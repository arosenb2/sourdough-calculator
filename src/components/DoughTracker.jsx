import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'timeago.js';
import useRecipeStore from '../stores/recipeStore';
import useTrackerStore from '../stores/trackerStore';
import { defaultRecipeName } from '../utils/formatting';
import { calculateRecipeFromTotalWeight } from '../utils/calculations';
import { validateTotalWeight } from '../utils/validations';
import WeightPicker from './WeightPicker';
import { toLocalInputValue } from '../utils/tracker';
import { Label, inputClass } from './steps/fields';

export const recipeLabel = (recipe) => recipe.name || defaultRecipeName(recipe);

function NewBakeForm() {
  const navigate = useNavigate();
  const savedRecipes = useRecipeStore((state) => state.savedRecipes);
  const addBake = useTrackerStore((state) => state.addBake);
  const [recipeId, setRecipeId] = useState('');
  const [name, setName] = useState('');
  const [startedAt, setStartedAt] = useState(() => toLocalInputValue());
  const [weight, setWeight] = useState('');

  if (!savedRecipes.length) {
    return (
      <p className="text-gray-600 dark:text-gray-400">
        Save a recipe first, then start a bake from it.{' '}
        <Link to="/" className="text-indigo-600 dark:text-indigo-400 underline">Create a recipe</Link>
      </p>
    );
  }

  const selected = savedRecipes.find((r) => r.id === recipeId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selected || !validateTotalWeight(weight)) return;
    const started = new Date(startedAt);
    const id = addBake({
      name: name.trim() || `${recipeLabel(selected)} – ${started.toLocaleDateString()}`,
      recipe: calculateRecipeFromTotalWeight({ ...selected, total: weight }),
      recipeId: selected.id,
      startedAt: (Number.isNaN(started.getTime()) ? new Date() : started).toISOString(),
    });
    navigate(`/tracker/${id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="bake-recipe">Recipe</Label>
        <select id="bake-recipe" className={inputClass} value={recipeId} onChange={(e) => setRecipeId(e.target.value)}>
          <option value="">Choose a saved recipe…</option>
          {savedRecipes.map((r) => (
            <option key={r.id} value={r.id}>{recipeLabel(r)}</option>
          ))}
        </select>
      </div>
      {selected && (
        <div>
          <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dough weight for this bake</p>
          <WeightPicker value={weight} onChange={setWeight} />
        </div>
      )}
      <div>
        <Label htmlFor="bake-name">Bake name (optional)</Label>
        <input id="bake-name" type="text" maxLength={100} className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="bake-start">Started</Label>
        <input id="bake-start" type="datetime-local" className={inputClass} value={startedAt} onChange={(e) => setStartedAt(e.target.value)} />
      </div>
      <button
        type="submit"
        disabled={!selected || !validateTotalWeight(weight)}
        className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Start tracking
      </button>
    </form>
  );
}

export default function DoughTracker() {
  const bakes = useTrackerStore((state) => state.bakes);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold dark:text-white">Dough Tracker</h2>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
          >
            {showForm ? 'Cancel' : 'New bake'}
          </button>
        </div>
        {showForm && (
          <div className="mt-4">
            <NewBakeForm />
          </div>
        )}
      </div>

      {bakes.length === 0 && !showForm && (
        <p className="text-center text-gray-600 dark:text-gray-400">
          No bakes yet. Start one from a saved recipe to log rise, temperature and notes.
        </p>
      )}

      <ul className="space-y-3">
        {bakes.map((bake) => (
          <li key={bake.id}>
            <Link
              to={`/tracker/${bake.id}`}
              className="block bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:ring-2 hover:ring-indigo-300"
            >
              <span className="block font-semibold text-gray-900 dark:text-white">{bake.name}</span>
              <span className="block text-sm text-gray-600 dark:text-gray-400">
                Started {format(bake.startedAt)} · {bake.entries.length} data point{bake.entries.length === 1 ? '' : 's'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
