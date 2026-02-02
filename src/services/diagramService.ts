import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  arrayUnion 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { SharedUser } from '../types';

export const diagramService = {
  async createDiagram(userId: string, name: string) {
    const docRef = await addDoc(collection(db, 'diagrams'), {
      name,
      createdAt: new Date(),
      createdBy: userId,
      sharedWith: [],
      nodes: [],
      edges: [],
    });
    return docRef.id;
  },

  async updateDiagram(diagramId: string, data: { nodes?: unknown[]; edges?: unknown[] }) {
    await updateDoc(doc(db, 'diagrams', diagramId), {
      ...data,
      updatedAt: new Date(),
    });
  },

  async deleteDiagram(diagramId: string) {
    await deleteDoc(doc(db, 'diagrams', diagramId));
  },

  async getDiagram(diagramId: string) {
    const diagramDoc = await getDoc(doc(db, 'diagrams', diagramId));
    if (!diagramDoc.exists()) {
      throw new Error('Diagram not found');
    }
    return { id: diagramDoc.id, ...diagramDoc.data() };
  },

  async shareWithUser(diagramId: string, sharedUser: SharedUser) {
    await updateDoc(doc(db, 'diagrams', diagramId), {
      sharedWith: arrayUnion(sharedUser),
    });
  },
};
