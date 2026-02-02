import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  backTo?: string;
  rightContent?: React.ReactNode;
}

export default function Header({ 
  title, 
  showBackButton = false, 
  backTo = '/dashboard',
  rightContent 
}: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to logout');
    }
  }

  return (
    <header className="sticky top-0 flex justify-between items-center px-6 py-3 bg-white dark:bg-[#242424] shadow-[0_1px_4px_rgba(0,0,0,0.1)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.3)] gap-3 z-[1000]">
      <div className="flex items-center gap-3 flex-1">
        {showBackButton && (
          <button onClick={() => navigate(backTo)} className="px-4 py-2 bg-white dark:bg-[#242424] text-[#667eea] border-2 border-[#667eea] rounded-md font-semibold cursor-pointer transition-all whitespace-nowrap text-sm hover:bg-[#667eea] hover:text-white hover:-translate-y-0.5">
            ← Back
          </button>
        )}
        {title && <h1 className="m-0 text-[#213547] dark:text-[#e0e0e0] text-2xl font-semibold">{title}</h1>}
      </div>

      <div className="flex items-center gap-3 flex-1 justify-center">
        {rightContent}
      </div>

      <div className="flex items-center gap-3 flex-1 justify-end">
        <ThemeToggle />
        
        <div className="relative" ref={dropdownRef}>
          <button 
            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#242424] border-2 border-[rgba(102,126,234,0.2)] rounded-lg cursor-pointer transition-all text-[#213547] dark:text-[#e0e0e0] hover:border-[#667eea] hover:shadow-[0_2px_8px_rgba(102,126,234,0.2)]"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white flex justify-center items-center text-xs font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm">{user?.email}</span>
            <svg 
              className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`}
              width="12" 
              height="12" 
              viewBox="0 0 12 12"
            >
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#242424] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] overflow-hidden">
              <div className="p-4 border-b border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white flex justify-center items-center text-sm font-bold mb-2">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-[#213547] dark:text-[#e0e0e0] break-all">{user?.email}</p>
                </div>
              </div>

              <div className="my-1"></div>

              <button 
                className="w-full flex items-center gap-3 px-4 py-3 bg-transparent border-none cursor-pointer text-left text-[#213547] dark:text-[#e0e0e0] transition-colors hover:bg-[#f5f5f5] dark:hover:bg-[#333]"
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/dashboard');
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 4h12v2H2V4zm0 4h12v2H2V8zm0 4h12v2H2v-2z"/>
                </svg>
                Dashboard
              </button>

              <button 
                className="w-full flex items-center gap-3 px-4 py-3 bg-transparent border-none cursor-pointer text-left text-[#213547] dark:text-[#e0e0e0] transition-colors hover:bg-[#f5f5f5] dark:hover:bg-[#333]"
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/profile');
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                Profile
              </button>

              <div className="my-1"></div>

              <button 
                className="w-full flex items-center gap-3 px-4 py-3 bg-transparent border-none cursor-pointer text-left text-[#dc3545] transition-colors hover:bg-[#fee] dark:hover:bg-[#4a1f1f]"
                onClick={() => {
                  setShowDropdown(false);
                  handleLogout();
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M6 14H4V2h2v12zm3-6l4-4v3h4v2h-4v3l-4-4z"/>
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
