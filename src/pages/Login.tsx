import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import ThemeToggle from '../components/ThemeToggle';
import '../styles/Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'editor' | 'viewer'>('viewer');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      
      if (isRegistering) {
        await authService.register(email, password, selectedRole);
      } else {
        await login(email, password);
      }
      
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(isRegistering ? 'Failed to register. User may already exist.' : 'Failed to sign in. Please check your credentials.');
      } else {
        setError('An error occurred. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="theme-toggle-wrapper">
        <ThemeToggle />
      </div>
      
      <div className="login-card">
        <h1>Visual Diagram Builder</h1>
        <h2>{isRegistering ? 'Register' : 'Login'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              minLength={6}
            />
          </div>
          
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as 'editor' | 'viewer')}
              >
                <option value="viewer">Viewer (View only)</option>
                <option value="editor">Editor (Full access)</option>
              </select>
            </div>
          )}
          
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (isRegistering ? 'Registering...' : 'Signing in...') : (isRegistering ? 'Register' : 'Sign In')}
          </button>
        </form>
        
        <div className="toggle-mode">
          <button 
            type="button" 
            onClick={() => setIsRegistering(!isRegistering)}
            className="link-button"
          >
            {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
