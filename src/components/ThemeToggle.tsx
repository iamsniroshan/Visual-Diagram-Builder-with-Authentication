import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      className="relative bg-gradient-to-r from-blue-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 cursor-pointer font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95" 
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className="text-lg">{theme === 'light' ? '🌙' : '☀️'}</span>
      <span className="text-sm">{theme === 'light' ? 'Dark' : 'Light'}</span>
    </button>
  );
}
