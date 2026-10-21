import { COLOR_THEMES } from '../utils/colorTheme';
import { useColorTheme } from '../hooks/useColorTheme';

// Sits beside the light/dark toggle; the two are independent.
export default function ThemeSwitcher() {
  const { colorTheme, setColorTheme } = useColorTheme();

  return (
    <label className="fixed z-50 sm:top-4 right-16 print:hidden">
      <span className="sr-only">Color theme</span>
      <select
        value={colorTheme}
        onChange={(e) => setColorTheme(e.target.value)}
        className="h-9 rounded-lg border-0 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200
          text-sm pl-3 pr-8 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700
          transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {COLOR_THEMES.map((theme) => (
          <option key={theme.id} value={theme.id}>{theme.label}</option>
        ))}
      </select>
    </label>
  );
}
