import { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Calculator from './components/Calculator';
import SavedRecipes from './components/SavedRecipes';
import PrintableRecipe from './components/PrintableRecipe';
import ThemeToggle from './components/ThemeToggle';
import useRecipeStore from './stores/recipeStore';
import PWAInstallPrompt from './components/PWAInstallPrompt';

export default function App() {
  const [showSaved, setShowSaved] = useState(false);
  const recipe = useRecipeStore((state) => state.recipe);
  const savedRecipes = useRecipeStore((state) => state.savedRecipes);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
        <ThemeToggle />
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Sourdough Calculator
            </h1>
            <button
              onClick={() => setShowSaved(!showSaved)}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              {showSaved ? 'Create New Recipe' : 'View Saved Recipes'}
            </button>
          </div>

          <Routes>
            <Route path="/" element={
              showSaved ? <SavedRecipes recipes={savedRecipes} /> : <Calculator />
            } />
            <Route
              path="/recipe"
              element={
                recipe ? <PrintableRecipe recipe={recipe} /> : <Navigate to="/" replace />
              }
            />
          </Routes>
        </div>
        <PWAInstallPrompt />
      </div>
    </Router>
  );
}