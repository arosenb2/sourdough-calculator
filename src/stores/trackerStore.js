import { create } from 'zustand';

const STORAGE_KEY = 'doughTracker';

const load = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const persist = (bakes) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bakes));
  } catch (error) {
    console.error('Could not save tracker data:', error);
  }
};

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/**
 * A bake references a saved recipe (by id) and keeps a snapshot of it, so the
 * tracker still works if the recipe is later renamed or deleted.
 */
const useTrackerStore = create((set, get) => {
  const commit = (bakes) => {
    persist(bakes);
    set({ bakes });
  };

  return {
    bakes: load(),

    addBake: ({ name, recipe, recipeId, startedAt }) => {
      const bake = {
        id: newId(),
        name,
        recipeId,
        recipe,
        startedAt,
        entries: [],
      };
      commit([bake, ...get().bakes]);
      return bake.id;
    },

    deleteBake: (bakeId) => commit(get().bakes.filter((b) => b.id !== bakeId)),

    addEntry: (bakeId, entry) =>
      commit(
        get().bakes.map((b) =>
          b.id === bakeId ? { ...b, entries: [...b.entries, { ...entry, id: newId() }] } : b
        )
      ),

    deleteEntry: (bakeId, entryId) =>
      commit(
        get().bakes.map((b) =>
          b.id === bakeId ? { ...b, entries: b.entries.filter((e) => e.id !== entryId) } : b
        )
      ),
  };
});

export default useTrackerStore;
