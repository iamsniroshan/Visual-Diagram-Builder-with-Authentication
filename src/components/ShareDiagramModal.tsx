import { useState } from 'react';
import type { FormEvent } from 'react';
import './ShareDiagramModal.css';

interface ShareDiagramModalProps {
  onClose: () => void;
  onShare: (email: string, access: 'view' | 'edit') => Promise<void>;
}

export default function ShareDiagramModal({ onClose, onShare }: ShareDiagramModalProps) {
  const [email, setEmail] = useState('');
  const [access, setAccess] = useState<'view' | 'edit'>('view');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal share-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Share Diagram</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="share-email">User Email</label>
            <input
              type="email"
              id="share-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="access-level">Access Level</label>
            <select
              id="access-level"
              value={access}
              onChange={(e) => setAccess(e.target.value as 'view' | 'edit')}
            >
              <option value="view">View Only</option>
              <option value="edit">Can Edit</option>
            </select>
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
