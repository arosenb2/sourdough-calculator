import { create } from 'zustand';
import { deleteSavedRecipe } from '../utils/storage';

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
  },
  getSavedRecipes: () => get().savedRecipes,
  updateRecipeName: (recipeId, newName) => {
    const savedRecipes = [...get().savedRecipes];
    const recipeIndex = savedRecipes.findIndex(r => r.id === recipeId);
    if (recipeIndex !== -1) {
      savedRecipes[recipeIndex] = { ...savedRecipes[recipeIndex], name: newName };
      localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
      set({ savedRecipes });
    }
  }
}));

export default useRecipeStore;