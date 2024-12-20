import { create } from 'zustand';

const useRecipeStore = create((set, get) => ({
  recipe: null,
  savedRecipes: JSON.parse(localStorage.getItem('savedRecipes') || '[]'),
  setRecipe: (recipe) => set({ recipe }),
  clearRecipe: () => set({ recipe: null }),
  saveRecipe: (recipe, name) => {
    const savedRecipes = [...get().savedRecipes];
    const timestamp = new Date().toISOString();
    savedRecipes.push({
      ...recipe,
      name,
      id: timestamp,
      createdAt: timestamp
    });
    localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
    set({ savedRecipes });
  },
  deleteRecipe: (recipeId) => {
    const updatedRecipes = deleteSavedRecipe(recipeId);
    set({ savedRecipes: updatedRecipes });
  }
}));

export default useRecipeStore;