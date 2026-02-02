import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDiagrams } from '../hooks/useDiagrams';
import { diagramService } from '../services/diagramService';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';

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
      <div className="flex flex-col justify-center items-center min-h-screen gap-4 text-[#213547] dark:text-[#e0e0e0]">
        <p>{error}</p>
        <button onClick={reload} className="px-6 py-3 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-md font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(102,126,234,0.4)]">Retry</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#2a2a2a] p-8">
      <Header 
        title="My Diagrams"
        rightContent={
          userData?.role === 'editor' && (
            <button onClick={() => setShowCreateModal(true)} className="px-6 py-3 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-md font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(102,126,234,0.4)]">
              + New Diagram
            </button>
          )
        }
      />

      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
        {diagrams.length === 0 ? (
          <div className="col-span-full text-center py-16 px-8 text-[#213547] dark:text-[#e0e0e0] opacity-60 text-lg">
            <p>No diagrams yet. {userData?.role === 'editor' ? 'Create your first diagram to get started!' : 'You have view-only access.'}</p>
          </div>
        ) : (
          diagrams.map((diagram) => (
            <div key={diagram.id} className="bg-white dark:bg-[#242424] p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_5px_20px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_5px_20px_rgba(0,0,0,0.4)]">
              <h3 className="m-0 mb-2 text-[#213547] dark:text-[#e0e0e0] text-xl">{diagram.name}</h3>
              <p className="text-[#213547] dark:text-[#e0e0e0] opacity-60 text-sm mb-2">
                Created: {diagram.createdAt.toLocaleDateString()}
              </p>
              <p className="text-[#213547] dark:text-[#e0e0e0] opacity-60 text-sm mb-2">
                {diagram.createdBy === user?.uid ? '(Owner)' : '(Shared)'}
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => navigate(`/diagram/${diagram.id}`)}
                  className="flex-1 py-2 bg-[#667eea] text-white border-none rounded-md cursor-pointer font-semibold transition-colors hover:bg-[#5568d3]"
                >
                  Open
                </button>
                {userData?.role === 'editor' && diagram.createdBy === user?.uid && (
                  <button
                    onClick={() => deleteDiagram(diagram.id)}
                    className="py-2 px-4 bg-[#dc3545] text-white border-none rounded-md cursor-pointer font-semibold transition-colors hover:bg-[#c82333]"
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
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex justify-center items-center z-[1000]" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white dark:bg-[#242424] p-8 rounded-xl w-[90%] max-w-[400px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)]" onClick={(e) => e.stopPropagation()}>
            <h2 className="m-0 mb-6 text-[#213547] dark:text-[#e0e0e0]">Create New Diagram</h2>
            <input
              type="text"
              value={newDiagramName}
              onChange={(e) => setNewDiagramName(e.target.value)}
              placeholder="Enter diagram name"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && createDiagram()}
              className="w-full p-3 border-2 border-[#ddd] dark:border-[#444] rounded-md text-base mb-6 bg-white dark:bg-[#2a2a2a] text-[#213547] dark:text-[#e0e0e0] focus:outline-none focus:border-[#667eea]"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowCreateModal(false)} className="px-6 py-3 bg-white dark:bg-[#242424] text-[#667eea] border-2 border-[#667eea] rounded-md font-semibold cursor-pointer transition-all hover:bg-[#667eea] hover:text-white" disabled={creating}>
                Cancel
              </button>
              <button onClick={createDiagram} className="px-6 py-3 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-md font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(102,126,234,0.4)] disabled:opacity-60 disabled:cursor-not-allowed" disabled={creating}>
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
