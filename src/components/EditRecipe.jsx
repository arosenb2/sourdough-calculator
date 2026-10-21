import { Navigate, useParams } from 'react-router-dom';
import Calculator from './Calculator';
import useRecipeStore from '../stores/recipeStore';

/** Opens a saved recipe in the wizard so its formula can be tweaked and saved in place. */
export default function EditRecipe() {
  const { id } = useParams();
  const recipe = useRecipeStore((state) => state.savedRecipes.find((r) => String(r.id) === id));

  if (!recipe) return <Navigate to="/saved" replace />;
  return <Calculator key={id} editing={recipe} />;
}
