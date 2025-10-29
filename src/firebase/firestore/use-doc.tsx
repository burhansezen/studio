'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  doc,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { WithId } from '@/firebase/firestore/use-collection';

/**
 * Interface for the return value of the useDoc hook.
 * @template T Type of the document data.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: FirestoreError | null;
}

/**
 * React hook to subscribe to a Firestore document in real-time.
 *
 * @template T The expected type of the document data.
 * @param {string | null | undefined} path - The path to the document in Firestore.
 * @returns {UseDocResult<T>} An object containing the document data, loading state, and any error.
 */
export function useDoc<T = any>(
  path: string | null | undefined
): UseDocResult<T> {
  const [data, setData] = useState<WithId<T> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | null>(null);
  const firestore = useFirestore();

  // Memoize the document reference to prevent re-creating it on every render.
  const docRef: DocumentReference<DocumentData> | null = useMemo(() => {
    if (!firestore || !path) {
      return null;
    }
    return doc(firestore, path);
  }, [firestore, path]);

  useEffect(() => {
    if (!docRef) {
      // If there's no document reference, reset the state.
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          const docData = { ...(snapshot.data() as T), id: snapshot.id };
          setData(docData);
        } else {
          // Handle the case where the document does not exist.
          setData(null);
        }
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        // Handle any errors from the snapshot listener.
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: docRef.path,
        });

        setError(contextualError);
        setData(null);
        setIsLoading(false);

        // Propagate error for global handling
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    // Cleanup function to unsubscribe from the snapshot listener.
    return () => unsubscribe();
  }, [docRef]); // Re-run the effect if the document reference changes.

  return { data, isLoading, error };
}
