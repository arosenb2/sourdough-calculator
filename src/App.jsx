import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Calculator from './components/Calculator';
import SavedRecipes from './components/SavedRecipes';
import PrintableRecipe from './components/PrintableRecipe';
import Layout from './components/Layout';
import RequireRecipe from './components/RequireRecipe';

export default function App() {
  return (
    <Router>
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
            element={<RequireRecipe><PrintableRecipe/></RequireRecipe>}
          />
        </Route>
      </Routes>
    </Router>
  );
}