import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="fixed p-2 rounded-lg bg-gray-100 dark:bg-gray-800
        text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700
        transition-colors duration-200 z-50
        sm:top-4 sm:right-4 right-4"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </button>
  );
}