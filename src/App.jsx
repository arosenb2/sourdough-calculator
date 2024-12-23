import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import useRecipeStore from './stores/recipeStore';
import { parseFloursFromUrl } from './utils/urlParams';
import Calculator from './components/Calculator';
import SavedRecipes from './components/SavedRecipes';
import PrintableRecipe from './components/PrintableRecipe';
import Layout from './components/Layout';
import RequireRecipe from './components/RequireRecipe';
import SharedRecipe from './components/SharedRecipe';

function AppContent() {
  const location = useLocation();
  const setRecipe = useRecipeStore((state) => state.setRecipe);

  useEffect(() => {
    if (location.pathname === '/shared' && location.search) {
      const params = new URLSearchParams(location.search);

      const recipe = {
        total: parseFloat(params.get('w')),
        hydration: parseFloat(params.get('h')),
        saltPercentage: parseFloat(params.get('s')),
        flours: parseFloursFromUrl(params.get('f'))
      };
      setRecipe(recipe);
    }
  }, [location, setRecipe]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Calculator />} />
        <Route path="/saved" element={<SavedRecipes />} />
        <Route
          path="/shared"
          element={<RequireRecipe><PrintableRecipe hideActions={false} /></RequireRecipe>}
        />
        <Route
          path="/recipe"
          element={<RequireRecipe><PrintableRecipe /></RequireRecipe>}
        />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Calculator />} />
          <Route path="/saved" element={<SavedRecipes />} />
          <Route path="/shared" element={<SharedRecipe />} />
          <Route
            path="/recipe"
            element={<RequireRecipe><PrintableRecipe /></RequireRecipe>}
          />
        </Route>
      </Routes>
    </Router>
  );
}