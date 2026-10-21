import { useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { parseFloursFromUrl, parseProcessFromUrl } from '../utils/urlParams';
import useRecipeStore from '../stores/recipeStore';
import PrintableRecipe from './PrintableRecipe';

export default function SharedRecipe() {
  const location = useLocation();
  const setRecipe = useRecipeStore(state => state.setRecipe);
  const recipe = useRecipeStore(state => state.recipe);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const parsedRecipe = {
      ...parseProcessFromUrl(params.get('p')),
      total: parseFloat(params.get('w')),
      hydration: parseFloat(params.get('h')),
      saltPercentage: parseFloat(params.get('s')),
      flours: parseFloursFromUrl(params.get('f'))
    };
    setRecipe(parsedRecipe);
  }, [location.search, setRecipe]);

  if (!recipe) {
    return null; // Loading state
  }

  return <PrintableRecipe hideActions={false} />;
}