import React from 'react';
import { useNavigate } from 'react-router-dom';

import SaveRecipeDialog from '../components/SaveRecipeDialog';
import Toast from '../components/Toast';
import RecipeActions from './recipe/RecipeActions';
import RecipeDetails from './recipe/RecipeDetails';
import useRecipeStore from '../stores/recipeStore';
import { calculateRecipeFromTotalWeight } from '../utils/calculations';
import { formatPercentage } from '../utils/formatting';
import { formatFloursForUrl } from '../utils/urlParams';

export default function PrintableRecipe({ hideActions }) {
  const navigate = useNavigate();
  const baseRecipe = useRecipeStore((state) => state.recipe);

  const recipe = React.useMemo(() => {
    if (!baseRecipe || !baseRecipe.flours) return null;
    return calculateRecipeFromTotalWeight(baseRecipe);
  }, [baseRecipe]);

  const saveRecipe = useRecipeStore(state => state.saveRecipe);
  const [saved, setSaved] = React.useState(false);
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [showToast, setShowToast] = React.useState(false);

  const defaultTitle = `${formatPercentage(recipe.hydration)}% Hydration Sourdough (${recipe.total}g)`;
  const hasCustomName = recipe.name && recipe.name !== defaultTitle;
  const title = recipe.name || defaultTitle;

  const handleShare = async () => {
    const params = new URLSearchParams({
      h: recipe.hydration,
      w: recipe.total,
      s: recipe.saltPercentage,
      f: formatFloursForUrl(recipe.flours)
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

  if (!recipe || !recipe.flours) {
    return null;
  }

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
            </div>

            <RecipeDetails recipe={recipe} />
          </div>
        </div>
      </div>
      {showSaveDialog && (
        <SaveRecipeDialog
          recipe={recipe}
          onSave={(name) => {
            saveRecipe(recipe, name);
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