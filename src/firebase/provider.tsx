'use client';

import type { FirebaseApp } from 'firebase/app';
import type { Auth, User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import React, { createContext, useContext, type ReactNode } from 'react';

type FirebaseContextValue = {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  user: User | null;
  areServicesAvailable: boolean;
};

const FirebaseContext = createContext<FirebaseContextValue | undefined>(
  undefined
);

type FirebaseProviderProps = {
  children: ReactNode;
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  user: User | null;
};

export function FirebaseProvider({
  children,
  firebaseApp,
  auth,
  firestore,
  user,
}: FirebaseProviderProps) {
  const value = {
    firebaseApp,
    auth,
    firestore,
    user,
    areServicesAvailable: !!(firebaseApp && auth && firestore),
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

// Custom hook to use the Firebase context
export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    throw new Error('Firebase core services not available. Check FirebaseProvider props.');
  }
  return {
    firebaseApp: context.firebaseApp,
    auth: context.auth,
    firestore: context.firestore,
    user: context.user,
  };
}

export function useFirebaseApp() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebaseApp must be used within a FirebaseProvider');
  }
  if (!context.areServicesAvailable || !context.firebaseApp) {
    throw new Error('FirebaseApp is not available. Check FirebaseProvider props.');
  }
  return context.firebaseApp;
}

export function useAuth() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  if (!context.areServicesAvailable || !context.auth) {
    throw new Error('Auth is not available. Check FirebaseProvider props.');
  }
  return { auth: context.auth, user: context.user };
}

export function useFirestore() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirestore must be used within a FirebaseProvider');
  }
  if (!context.areServicesAvailable || !context.firestore) {
    throw new Error('Firestore is not available. Check FirebaseProvider props.');
  }
  return context.firestore;
}
