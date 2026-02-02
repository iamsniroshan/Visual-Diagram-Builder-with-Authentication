import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      className="bg-transparent border-2 border-[#ddd] dark:border-[#555] rounded-full w-10 h-10 flex items-center justify-center cursor-pointer text-xl transition-all duration-300 hover:scale-110 hover:border-[#007bff] dark:hover:border-[#4a9eff] active:scale-95" 
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
