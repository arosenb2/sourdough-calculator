import { create } from 'zustand';
import { deleteSavedRecipe, getSavedRecipes } from '../utils/storage';

const loadSavedRecipes = () => {
  try {
    return getSavedRecipes();
  } catch {
    return [];
  }
};

const useRecipeStore = create((set, get) => ({
  recipe: null,
  savedRecipes: loadSavedRecipes(),
  setRecipe: (recipe) => set({ recipe }),
  clearSavedRecipes: () => {
    localStorage.setItem('savedRecipes', JSON.stringify([]));
    set({ savedRecipes: [] });
  },
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
  // Replace a saved recipe's formula, keeping its id, name and date
  updateRecipe: (recipeId, formula) => {
    const savedRecipes = get().savedRecipes.map((r) =>
      r.id === recipeId ? { ...formula, id: r.id, name: r.name, createdAt: r.createdAt } : r
    );
    localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
    set({ savedRecipes });
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
