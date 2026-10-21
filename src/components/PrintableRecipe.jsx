import React from 'react';
import { useNavigate } from 'react-router-dom';

import SaveRecipeDialog from '../components/SaveRecipeDialog';
import Toast from '../components/Toast';
import RecipeActions from './recipe/RecipeActions';
import RecipeDetails from './recipe/RecipeDetails';
import useRecipeStore from '../stores/recipeStore';
import WeightPicker from './WeightPicker';
import { calculateRecipeFromTotalWeight } from '../utils/calculations';
import { defaultRecipeName, formatWeight } from '../utils/formatting';
import { toFormula } from '../utils/recipeDefaults';
import { validateTotalWeight } from '../utils/validations';
import { formatFloursForUrl, formatProcessForUrl } from '../utils/urlParams';

export default function PrintableRecipe({ hideActions, recipe: recipeProp }) {
  const navigate = useNavigate();
  const storeRecipe = useRecipeStore((state) => state.recipe);
  const baseRecipe = recipeProp || storeRecipe;

  // The weight can be (re)chosen here; a recipe without one asks for it first
  const [chosenTotal, setChosenTotal] = React.useState('');
  const [draftTotal, setDraftTotal] = React.useState('');
  const [changingWeight, setChangingWeight] = React.useState(false);
  const total = chosenTotal !== '' ? chosenTotal : baseRecipe?.total;
  const hasTotal = validateTotalWeight(total);

  const recipe = React.useMemo(() => {
    if (!baseRecipe || !baseRecipe.flours || !hasTotal) return null;
    return calculateRecipeFromTotalWeight({ ...baseRecipe, total });
  }, [baseRecipe, total, hasTotal]);

  const saveRecipe = useRecipeStore(state => state.saveRecipe);
  const [saved, setSaved] = React.useState(false);
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [showToast, setShowToast] = React.useState(false);

  if (!baseRecipe || !baseRecipe.flours) {
    return null;
  }

  const defaultTitle = defaultRecipeName(baseRecipe);
  const hasCustomName = baseRecipe.name && baseRecipe.name !== defaultTitle;
  const title = baseRecipe.name || defaultTitle;

  if (!recipe) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 print:hidden">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">How much dough do you want to make?</p>
        <WeightPicker value={draftTotal} onChange={setDraftTotal} onPreset={setChosenTotal} />
        <button
          onClick={() => setChosenTotal(draftTotal)}
          disabled={!validateTotalWeight(draftTotal)}
          className="mt-4 px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Show recipe
        </button>
      </div>
    );
  }

  const handleShare = async () => {
    const params = new URLSearchParams({
      h: recipe.hydration,
      w: recipe.total,
      s: recipe.saltPercentage,
      f: formatFloursForUrl(recipe.flours),
      p: formatProcessForUrl(recipe)
    });
    const url = `${window.location.origin}${window.location.pathname}#/shared?${params.toString()}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Sourdough Recipe',
          text: title,
          url: url
        });
      } else {
        await navigator.clipboard.writeText(url);
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleNewRecipe = () => {
    navigate('/');
  };

  return (
    <>
      <div className="print:p-8 print-only">
        <div className="max-w-2xl mx-auto">
          {!hideActions && (
            <RecipeActions
              onNew={handleNewRecipe}
              onShare={handleShare}
              onSave={() => setShowSaveDialog(true)}
              onPrint={() => window.print()}
              saved={saved}
            />
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 print:shadow-none print:text-black">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
              {hasCustomName && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {defaultTitle}
                </p>
              )}
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Target dough weight: {formatWeight(recipe.total)}
                <button
                  onClick={() => setChangingWeight((v) => !v)}
                  className="ml-3 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 print:hidden"
                >
                  {changingWeight ? 'Done' : 'Change'}
                </button>
              </p>
              {changingWeight && (
                <div className="mt-4 print:hidden">
                  <WeightPicker value={recipe.total} onChange={(grams) => grams !== '' && setChosenTotal(grams)} />
                </div>
              )}
            </div>

            <RecipeDetails recipe={recipe} />
          </div>
        </div>
      </div>
      {showSaveDialog && (
        <SaveRecipeDialog
          recipe={baseRecipe}
          onSave={(name) => {
            saveRecipe(toFormula(baseRecipe), name);
            setSaved(true);
            setShowSaveDialog(false);
          }}
          onCancel={() => setShowSaveDialog(false)}
        />
      )}
      {showToast && (
        <Toast
          message="Recipe link copied to clipboard!"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}