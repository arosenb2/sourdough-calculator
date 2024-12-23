import { Outlet } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import Navigation from './Navigation';
import PWAInstallPrompt from './PWAInstallPrompt';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
      <ThemeToggle />
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 pt-4 sm:pt-0">
            Sourdough Calculator
          </h1>
          <Navigation />
        </div>
        <Outlet />
      </div>
      <PWAInstallPrompt />
    </div>
  );
}