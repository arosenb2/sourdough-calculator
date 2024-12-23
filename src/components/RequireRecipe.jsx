import { Navigate } from 'react-router-dom';
import useRecipeStore from '../stores/recipeStore';

export default function RequireRecipe({ children }) {
  const recipe = useRecipeStore(state => state.recipe);

  if (!recipe) {
    return <Navigate to="/" replace />;
  }

  return children;
}