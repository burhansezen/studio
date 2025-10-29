'use client';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentReference,
  getFirestore,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Non-blocking version of addDoc.
 *
 * @param collectionName Name of the collection.
 * @param data Data to be added.
 */
export function addDocumentNonBlocking<T>(
  collectionName: string,
  data: T
): void {
  const db = getFirestore();
  const collRef = collection(db, collectionName);

  addDoc(collRef, data).catch((error) => {
    const contextualError = new FirestorePermissionError({
      operation: 'create',
      path: collRef.path,
      resource: data as any,
    });
    errorEmitter.emit('permission-error', contextualError);
  });
}

/**
 * Non-blocking version of setDoc.
 *
 * @param docRef Document reference.
 * @param data Data to be set.
 * @param merge Whether to merge the data. Default is true.
 */
export function setDocumentNonBlocking<T>(
  docRef: DocumentReference,
  data: T,
  merge = true
): void {
  setDoc(docRef, data, { merge }).catch((error) => {
    const contextualError = new FirestorePermissionError({
      operation: 'update',
      path: docRef.path,
      resource: data as any,
    });
    errorEmitter.emit('permission-error', contextualError);
  });
}

/**
 * Non-blocking version of updateDoc.
 *
 * @param docRef Document reference.
 * @param data Data to be updated.
 */
export function updateDocumentNonBlocking<T>(
  docRef: DocumentReference,
  data: T
): void {
  updateDoc(docRef, data as any).catch((error) => {
    const contextualError = new FirestorePermissionError({
      operation: 'update',
      path: docRef.path,
      resource: data as any,
    });
    errorEmitter.emit('permission-error', contextualError);
  });
}

/**
 * Non-blocking version of deleteDoc.
 *
 * @param docRef Document reference.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference): void {
  deleteDoc(docRef).catch((error) => {
    const contextualError = new FirestorePermissionError({
      operation: 'delete',
      path: docRef.path,
    });
    errorEmitter.emit('permission-error', contextualError);
  });
}
