import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import ThemeToggle from '../components/ThemeToggle';

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
    <div className="relative flex justify-center items-center min-h-screen">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      
      <div className="bg-white dark:bg-[#242424] p-10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)] w-full max-w-[400px]">
        <h1 className="text-2xl text-[#667eea] dark:text-[#8b9eff] mb-2 text-center">Visual Diagram Builder</h1>
        <h2 className="text-[1.75rem] mb-8 text-center text-[#213547] dark:text-[#e0e0e0]">{isRegistering ? 'Register' : 'Login'}</h2>
        
        {error && <div className="bg-[#fee] dark:bg-[#4a1f1f] text-[#c33] dark:text-[#ff6b6b] p-3 rounded-md mb-4 border-l-4 border-[#c33] dark:border-[#ff6b6b]">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="email" className="block mb-2 text-[#213547] dark:text-[#e0e0e0] font-medium">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-full p-3 border-2 border-[#ddd] dark:border-[#444] rounded-md text-base transition-colors bg-white dark:bg-[#2a2a2a] text-[#213547] dark:text-[#e0e0e0] focus:outline-none focus:border-[#667eea]"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block mb-2 text-[#213547] dark:text-[#e0e0e0] font-medium">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              minLength={6}
              className="w-full p-3 border-2 border-[#ddd] dark:border-[#444] rounded-md text-base transition-colors bg-white dark:bg-[#2a2a2a] text-[#213547] dark:text-[#e0e0e0] focus:outline-none focus:border-[#667eea]"
            />
          </div>
          
          {isRegistering && (
            <div className="mb-6">
              <label htmlFor="role" className="block mb-2 text-[#213547] dark:text-[#e0e0e0] font-medium">Role</label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as 'editor' | 'viewer')}
                className="w-full p-3 border-2 border-[#ddd] dark:border-[#444] rounded-md text-base transition-colors bg-white dark:bg-[#2a2a2a] text-[#213547] dark:text-[#e0e0e0] focus:outline-none focus:border-[#667eea]"
              >
                <option value="viewer">Viewer (View only)</option>
                <option value="editor">Editor (Full access)</option>
              </select>
            </div>
          )}
          
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-md text-base font-semibold cursor-pointer transition-all hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_5px_15px_rgba(102,126,234,0.4)] disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? (isRegistering ? 'Registering...' : 'Signing in...') : (isRegistering ? 'Register' : 'Sign In')}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            type="button" 
            onClick={() => setIsRegistering(!isRegistering)}
            className="bg-transparent border-none text-[#667eea] dark:text-[#8b9eff] cursor-pointer text-[0.95rem] underline p-0 hover:text-[#764ba2] dark:hover:text-[#a8b3ff]"
          >
            {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
