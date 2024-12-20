const STORAGE_KEY = 'savedRecipes';

export const saveRecipe = (recipe) => {
  const savedRecipes = getSavedRecipes();
  const newRecipe = { ...recipe, id: Date.now(), createdAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...savedRecipes, newRecipe]));
  return newRecipe;
};

export const getSavedRecipes = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};