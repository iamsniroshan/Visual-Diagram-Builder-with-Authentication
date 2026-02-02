import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, or } from 'firebase/firestore';
import { db } from '../firebase';
import type { Diagram } from '../types';

export function useDiagrams(userId: string | undefined) {
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setDiagrams([]);
      setLoading(false);
      return;
    }

    loadDiagrams();
  }, [userId]);

  async function loadDiagrams() {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const diagramsRef = collection(db, 'diagrams');
      
      // Query diagrams created by user or shared with user's email
      const q = query(
        diagramsRef,
        or(
          where('createdBy', '==', userId),
          where('sharedWith', 'array-contains-any', [userId])
        )
      );
      
      const querySnapshot = await getDocs(q);
      const diagramsList: Diagram[] = [];
      
      querySnapshot.forEach((doc) => {
        diagramsList.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        } as Diagram);
      });

      setDiagrams(diagramsList);
    } catch (err) {
      console.error('Error loading diagrams:', err);
      setError('Failed to load diagrams');
    } finally {
      setLoading(false);
    }
  }

  return { diagrams, loading, error, reload: loadDiagrams };
}
