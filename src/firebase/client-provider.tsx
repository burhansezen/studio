'use client';

import { ReactNode } from 'react';
import { FirebaseProvider, initializeFirebase } from '@/firebase';

export const FirebaseClientProvider = ({ children }: { children: ReactNode }) => {
  const { firebaseApp, auth, firestore } = initializeFirebase();

  return (
    <FirebaseProvider firebaseApp={firebaseApp} auth={auth} firestore={firestore}>
      {children}
    </FirebaseProvider>
  );
};
