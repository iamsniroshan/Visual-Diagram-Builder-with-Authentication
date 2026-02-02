import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { authService } from '../services/authService';
import type { UserData } from '../types';

interface ShareDiagramModalProps {
  onClose: () => void;
  onShare: (email: string, access: 'view' | 'edit') => Promise<void>;
  currentUserEmail: string;
}

export default function ShareDiagramModal({ onClose, onShare, currentUserEmail }: ShareDiagramModalProps) {
  const [email, setEmail] = useState('');
  const [access, setAccess] = useState<'view' | 'edit'>('view');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const allUsers = await authService.getAllUsers();
        // Filter out current user
        const otherUsers = allUsers.filter(u => u.email !== currentUserEmail);
        setUsers(otherUsers);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load users. You can still enter an email manually.');
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
  }, [currentUserEmail]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await onShare(email, access);
      onClose();
    } catch (err) {
      setError('Failed to share diagram. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex justify-center items-center z-[1000]" onClick={onClose}>
      <div className="bg-white dark:bg-[#242424] p-8 rounded-xl w-[90%] max-w-[500px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)]" onClick={(e) => e.stopPropagation()}>
        <h2 className="m-0 mb-6 text-[#213547] dark:text-[#e0e0e0]">Share Diagram</h2>
        
        {error && <div className="bg-[#fee] dark:bg-[#4a1f1f] text-[#c33] dark:text-[#ff6b6b] p-3 rounded-md mb-4 border-l-4 border-[#c33] dark:border-[#ff6b6b]">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="share-email" className="block mb-2 font-medium text-[#213547] dark:text-[#e0e0e0]">User Email</label>
            {loadingUsers ? (
              <div className="text-[#666] dark:text-[#999] text-sm">Loading users...</div>
            ) : users.length > 0 ? (
              <select
                id="share-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-[#ddd] dark:border-[#444] rounded text-base bg-white dark:bg-[#2a2a2a] text-[#213547] dark:text-[#e0e0e0] focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
              >
                <option value="">Select a user...</option>
                {users.map((user) => (
                  <option key={user.email} value={user.email}>
                    {user.email} ({user.role})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="email"
                id="share-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
                className="w-full p-3 border border-[#ddd] dark:border-[#444] rounded text-base bg-white dark:bg-[#2a2a2a] text-[#213547] dark:text-[#e0e0e0] focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
              />
            )}
          </div>
          
          <div className="mb-6">
            <label htmlFor="access-level" className="block mb-2 font-medium text-[#213547] dark:text-[#e0e0e0]">Access Level</label>
            <select
              id="access-level"
              value={access}
              onChange={(e) => setAccess(e.target.value as 'view' | 'edit')}
              className="w-full p-3 border border-[#ddd] dark:border-[#444] rounded text-base bg-white dark:bg-[#2a2a2a] text-[#213547] dark:text-[#e0e0e0] focus:outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
            >
              <option value="view">View Only</option>
              <option value="edit">Can Edit</option>
            </select>
          </div>
          
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-white dark:bg-[#242424] text-[#667eea] border-2 border-[#667eea] rounded-md font-semibold cursor-pointer transition-all hover:bg-[#667eea] hover:text-white" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="px-6 py-3 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-md font-semibold cursor-pointer" disabled={loading}>
              {loading ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
