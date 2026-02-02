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
import '../styles/DiagramEditor.css';

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
    <div className="editor-container">
      <Header 
        title={diagramName}
        showBackButton={true}
        backTo="/dashboard"
        rightContent={
          <>
            <span className="role-badge">{userData?.role}</span>
            {isEditor && (
              <>
                {isOwner && (
                  <button onClick={() => setShowShareModal(true)} className="btn-share">
                    Share
                  </button>
                )}
                <button onClick={addNode} className="btn-add-node">
                  + Add Node
                </button>
                <button onClick={saveDiagram} disabled={saving} className="btn-save">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
          </>
        }
      />

      <div className="flow-wrapper">
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
          <div className="viewer-overlay">
            <p>View Only Mode</p>
          </div>
        )}
      </div>

      {isEditor && (
        <div className="editor-sidebar">
          <h3>Selected Items</h3>
          <div className="node-list">
            {nodes.map((node) => (
              <div key={node.id} className="node-item">
                <span>{node.data.label as string}</span>
                <div className="node-item-actions">
                  <button onClick={() => startEditingNode(node)} className="btn-edit">
                    Edit
                  </button>
                  <button onClick={() => deleteNode(node.id)} className="btn-delete-small">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h3>Edges ({edges.length})</h3>
          <div className="edge-list">
            {edges.map((edge) => (
              <div key={edge.id} className="edge-item">
                <span>
                  {edge.source} → {edge.target}
                </span>
                <button onClick={() => deleteEdge(edge.id)} className="btn-delete-small">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {editingNodeId && (
        <div className="modal-overlay" onClick={() => setEditingNodeId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Node Label</h2>
            <input
              type="text"
              value={editingLabel}
              onChange={(e) => setEditingLabel(e.target.value)}
              placeholder="Enter node label"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && saveNodeLabel()}
            />
            <div className="modal-actions">
              <button onClick={() => setEditingNodeId(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={saveNodeLabel} className="btn-primary">
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
        />
      )}
    </div>
  );
}
