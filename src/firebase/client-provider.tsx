'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { FirebaseProvider } from '@/firebase/provider';

let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

type FirebaseServices = {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

export function initializeFirebase(): FirebaseServices {
  if (firebaseApp && auth && firestore) {
    return { firebaseApp, auth, firestore };
  }

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const newFirebaseApp = initializeApp(firebaseConfig);
  const newAuth = getAuth(newFirebaseApp);
  const newFirestore = getFirestore(newFirebaseApp);

  firebaseApp = newFirebaseApp;
  auth = newAuth;
  firestore = newFirestore;

  return { firebaseApp, auth, firestore };
}

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  const [firebaseServices, setFirebaseServices] =
    useState<FirebaseServices | null>(null);

  useEffect(() => {
    // This ensures initializeFirebase is only called on the client-side
    // after the component has mounted.
    if (typeof window !== 'undefined') {
      setFirebaseServices(initializeFirebase());
    }
  }, []);

  if (!firebaseServices) {
    // You can render a loading spinner or null here
    // while Firebase is being initialized.
    return <div>Yükleniyor...</div>;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
