import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import type {
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import ShareDiagramModal from '../components/ShareDiagramModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { diagramService } from '../services/diagramService';
import type { SharedUser } from '../types';

let nodeId = 0;

export default function DiagramEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [diagramName, setDiagramName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const isEditor = userData?.role === 'editor';

  useEffect(() => {
    loadDiagram();
  }, [id]);

  async function loadDiagram() {
    if (!id || !user) return;

    try {
      const diagramDoc = await getDoc(doc(db, 'diagrams', id));
      
      if (!diagramDoc.exists()) {
        alert('Diagram not found');
        navigate('/dashboard');
        return;
      }

      const data = diagramDoc.data();
      setDiagramName(data.name);
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
      setIsOwner(data.createdBy === user.uid);
      
      if (data.nodes && data.nodes.length > 0) {
        const maxId = Math.max(...data.nodes.map((n: Node) => parseInt(n.id) || 0));
        nodeId = maxId + 1;
      }
    } catch (error) {
      console.error('Error loading diagram:', error);
      alert('Failed to load diagram');
    } finally {
      setLoading(false);
    }
  }

  const onConnect = useCallback(
    (params: Connection) => {
      if (!isEditor) return;
      setEdges((eds) => addEdge(params, eds));
    },
    [isEditor, setEdges]
  );

  const addNode = () => {
    if (!isEditor) return;

    const newNode: Node = {
      id: `${nodeId++}`,
      type: 'default',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: `Node ${nodeId}` },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const deleteNode = (nodeId: string) => {
    if (!isEditor) return;
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  };

  const deleteEdge = (edgeId: string) => {
    if (!isEditor) return;
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
  };

  const startEditingNode = (node: Node) => {
    if (!isEditor) return;
    setEditingNodeId(node.id);
    setEditingLabel(node.data.label as string);
  };

  const saveNodeLabel = () => {
    if (!editingNodeId) return;

    setNodes((nds) =>
      nds.map((node) =>
        node.id === editingNodeId
          ? { ...node, data: { ...node.data, label: editingLabel } }
          : node
      )
    );

    setEditingNodeId(null);
    setEditingLabel('');
  };

  const saveDiagram = async () => {
    if (!id || !isEditor) return;

    try {
      setSaving(true);
      await updateDoc(doc(db, 'diagrams', id), {
        nodes: nodes,
        edges: edges,
        updatedAt: new Date(),
      });
      alert('Diagram saved successfully!');
    } catch (error) {
      console.error('Error saving diagram:', error);
      alert('Failed to save diagram');
    } finally {
      setSaving(false);
    }
  };

  async function handleShare(email: string, access: 'view' | 'edit') {
    if (!id) return;
    
    try {
      const sharedUser: SharedUser = { email, access };
      await diagramService.shareWithUser(id, sharedUser);
      alert(`Diagram shared with ${email}!`);
    } catch (error) {
      console.error('Error sharing diagram:', error);
      throw error;
    }
  }

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (!isEditor) {
        // Filter out position changes for viewers
        const filteredChanges = changes.filter((change) => change.type !== 'position');
        onNodesChange(filteredChanges);
        return;
      }
      onNodesChange(changes);
    },
    [isEditor, onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (!isEditor) return;
      onEdgesChange(changes);
    },
    [isEditor, onEdgesChange]
  );

  if (loading) {
    return <LoadingSpinner message="Loading diagram..." />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#f8f9fa] dark:bg-[#2a2a2a] p-0 pb-0">
      <Header 
        title={diagramName}
        showBackButton={true}
        backTo="/dashboard"
        rightContent={
          <>
            {isEditor && (
              <>
                {isOwner && (
                  <button onClick={() => setShowShareModal(true)} className="px-4 py-2 bg-[#17a2b8] text-white border-none rounded-md font-semibold cursor-pointer transition-colors hover:bg-[#138496]">
                    Share
                  </button>
                )}
                <button onClick={addNode} className="px-4 py-2 bg-[#28a745] text-white border-none rounded-md font-semibold cursor-pointer transition-colors hover:bg-[#218838]">
                  + Add Node
                </button>
                <button onClick={saveDiagram} disabled={saving} className="px-6 py-2 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-md font-semibold cursor-pointer transition-transform hover:enabled:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
          </>
        }
      />

      <div className="flex-1 relative w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={(_, node) => startEditingNode(node)}
          fitView
          nodesDraggable={isEditor}
          nodesConnectable={isEditor}
          elementsSelectable={isEditor}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>

        {!isEditor && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-[rgba(255,152,0,0.9)] text-white px-6 py-3 rounded-lg font-semibold z-10 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
            <p>View Only Mode</p>
          </div>
        )}
      </div>

      {isEditor && (
        <div className="fixed right-8 top-1/2 -translate-y-1/2 w-[300px] max-h-[calc(100vh-200px)] bg-white dark:bg-[#242424] p-6 overflow-y-auto rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)] z-[100] backdrop-blur-[10px] border border-[rgba(102,126,234,0.2)]">
          <h3 className="m-0 mb-4 text-[#213547] dark:text-[#e0e0e0] text-base font-semibold border-b-2 border-[rgba(102,126,234,0.2)] pb-2">Selected Items</h3>
          <div className="flex flex-col gap-2 mb-8">
            {nodes.map((node) => (
              <div key={node.id} className="flex justify-between items-center p-3 bg-[rgba(102,126,234,0.05)] rounded-md text-sm text-[#213547] dark:text-[#e0e0e0] border border-[rgba(102,126,234,0.1)] transition-all gap-2 hover:bg-[rgba(102,126,234,0.1)] hover:border-[rgba(102,126,234,0.3)]">
                <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{node.data.label as string}</span>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => startEditingNode(node)} className="px-2 py-1 bg-[#667eea] text-white border-none rounded text-xs cursor-pointer transition-colors hover:bg-[#5568d3]">
                    Edit
                  </button>
                  <button onClick={() => deleteNode(node.id)} className="px-2 py-1 bg-[#dc3545] text-white border-none rounded text-xs cursor-pointer transition-colors hover:bg-[#c82333]">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h3 className="m-0 mb-4 text-[#213547] dark:text-[#e0e0e0] text-base font-semibold border-b-2 border-[rgba(102,126,234,0.2)] pb-2">Edges ({edges.length})</h3>
          <div className="flex flex-col gap-2 mb-8">
            {edges.map((edge) => (
              <div key={edge.id} className="flex justify-between items-center p-3 bg-[rgba(102,126,234,0.05)] rounded-md text-sm text-[#213547] dark:text-[#e0e0e0] border border-[rgba(102,126,234,0.1)] transition-all gap-2 hover:bg-[rgba(102,126,234,0.1)] hover:border-[rgba(102,126,234,0.3)]">
                <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {edge.source} → {edge.target}
                </span>
                <button onClick={() => deleteEdge(edge.id)} className="px-2 py-1 bg-[#dc3545] text-white border-none rounded text-xs cursor-pointer transition-colors hover:bg-[#c82333]">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {editingNodeId && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex justify-center items-center z-[1000]" onClick={() => setEditingNodeId(null)}>
          <div className="bg-white dark:bg-[#242424] p-8 rounded-xl w-[90%] max-w-[400px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)]" onClick={(e) => e.stopPropagation()}>
            <h2 className="m-0 mb-6 text-[#213547] dark:text-[#e0e0e0]">Edit Node Label</h2>
            <input
              type="text"
              value={editingLabel}
              onChange={(e) => setEditingLabel(e.target.value)}
              placeholder="Enter node label"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && saveNodeLabel()}
              className="w-full p-3 border-2 border-[#ddd] dark:border-[#444] rounded-md text-base mb-6 bg-white dark:bg-[#2a2a2a] text-[#213547] dark:text-[#e0e0e0] focus:outline-none focus:border-[#667eea]"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditingNodeId(null)} className="px-6 py-3 bg-white dark:bg-[#242424] text-[#667eea] border-2 border-[#667eea] rounded-md font-semibold cursor-pointer transition-all hover:bg-[#667eea] hover:text-white">
                Cancel
              </button>
              <button onClick={saveNodeLabel} className="px-6 py-3 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-md font-semibold cursor-pointer">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showShareModal && (
        <ShareDiagramModal
          onClose={() => setShowShareModal(false)}
          onShare={handleShare}
          currentUserEmail={user?.email || ''}
        />
      )}
    </div>
  );
}
