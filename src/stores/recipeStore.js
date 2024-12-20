import { create } from 'zustand';

const useRecipeStore = create((set) => ({
  recipe: null,
  setRecipe: (recipe) => set({ recipe }),
  clearRecipe: () => set({ recipe: null }),
}));

export default useRecipeStore;