import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import './Header.css';

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
  const { user, userData, logout } = useAuth();
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
    <header className="common-header">
      <div className="header-left">
        {showBackButton && (
          <button onClick={() => navigate(backTo)} className="btn-back">
            ← Back
          </button>
        )}
        {title && <h1 className="header-title">{title}</h1>}
      </div>

      <div className="header-center">
        {rightContent}
      </div>

      <div className="header-right">
        <ThemeToggle />
        
        <div className="profile-dropdown-container" ref={dropdownRef}>
          <button 
            className="profile-trigger"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="profile-avatar-small">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <span className="user-email-display">{user?.email}</span>
            <svg 
              className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}
              width="12" 
              height="12" 
              viewBox="0 0 12 12"
            >
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </button>

          {showDropdown && (
            <div className="profile-dropdown-menu">
              <div className="dropdown-header">
                <div className="profile-avatar-medium">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="dropdown-user-info">
                  <p className="dropdown-email">{user?.email}</p>
                  <span className={`role-badge ${userData?.role}`}>
                    {userData?.role || 'viewer'}
                  </span>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              <button 
                className="dropdown-item"
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
                className="dropdown-item"
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

              <div className="dropdown-divider"></div>

              <button 
                className="dropdown-item logout"
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
