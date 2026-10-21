import { NavLink, useLocation } from 'react-router-dom';

const linkClass = ({ isActive }) =>
  `${isActive ? 'font-semibold underline' : ''} text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300`;

export default function Navigation() {
  const location = useLocation();

  if (location.pathname === '/shared') return null;

  return (
    <nav className="flex justify-center gap-6">
      <NavLink to="/" end className={linkClass}>New Recipe</NavLink>
      <NavLink to="/saved" className={linkClass}>Saved Recipes</NavLink>
      <NavLink to="/tracker" className={linkClass}>Dough Tracker</NavLink>
    </nav>
  );
}
