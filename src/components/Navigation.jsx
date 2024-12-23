import { useNavigate, useLocation } from 'react-router-dom';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div>
      {location.pathname === '/saved' ? (
        <button
          onClick={() => navigate('/')}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
        >
          Create New Recipe
        </button>
      ) : location.pathname !== '/shared' && (
        <button
          onClick={() => navigate('/saved')}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
        >
          View Saved Recipes
        </button>
      )}
    </div>
  );
}