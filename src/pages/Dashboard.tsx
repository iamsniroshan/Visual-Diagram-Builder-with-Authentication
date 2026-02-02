import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDiagrams } from '../hooks/useDiagrams';
import { diagramService } from '../services/diagramService';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const [newDiagramName, setNewDiagramName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const { user, userData } = useAuth();
  const { diagrams, loading, error, reload } = useDiagrams(user?.uid);
  const navigate = useNavigate();

  async function createDiagram() {
    if (!user || !newDiagramName.trim()) return;

    try {
      setCreating(true);
      const diagramId = await diagramService.createDiagram(user.uid, newDiagramName);
      setShowCreateModal(false);
      setNewDiagramName('');
      navigate(`/diagram/${diagramId}`);
    } catch (error) {
      console.error('Error creating diagram:', error);
      alert('Failed to create diagram');
    } finally {
      setCreating(false);
    }
  }

  async function deleteDiagram(diagramId: string) {
    if (!confirm('Are you sure you want to delete this diagram?')) return;

    try {
      await diagramService.deleteDiagram(diagramId);
      await reload();
    } catch (error) {
      console.error('Error deleting diagram:', error);
      alert('Failed to delete diagram');
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading diagrams..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={reload} className="btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Header 
        title="My Diagrams"
        rightContent={
          userData?.role === 'editor' && (
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              + New Diagram
            </button>
          )
        }
      />

      <div className="diagrams-grid">
        {diagrams.length === 0 ? (
          <div className="empty-state">
            <p>No diagrams yet. {userData?.role === 'editor' ? 'Create your first diagram to get started!' : 'You have view-only access.'}</p>
          </div>
        ) : (
          diagrams.map((diagram) => (
            <div key={diagram.id} className="diagram-card">
              <h3>{diagram.name}</h3>
              <p className="diagram-date">
                Created: {diagram.createdAt.toLocaleDateString()}
              </p>
              <p className="diagram-info">
                {diagram.createdBy === user?.uid ? '(Owner)' : '(Shared)'}
              </p>
              <div className="diagram-actions">
                <button
                  onClick={() => navigate(`/diagram/${diagram.id}`)}
                  className="btn-view"
                >
                  Open
                </button>
                {userData?.role === 'editor' && diagram.createdBy === user?.uid && (
                  <button
                    onClick={() => deleteDiagram(diagram.id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Diagram</h2>
            <input
              type="text"
              value={newDiagramName}
              onChange={(e) => setNewDiagramName(e.target.value)}
              placeholder="Enter diagram name"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && createDiagram()}
            />
            <div className="modal-actions">
              <button onClick={() => setShowCreateModal(false)} className="btn-secondary" disabled={creating}>
                Cancel
              </button>
              <button onClick={createDiagram} className="btn-primary" disabled={creating}>
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
