'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously, type Auth, type User } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { FirebaseProvider } from './provider';

// Hardcode Firebase config. Studio will replace these with actual values.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};


type FirebaseServices = {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

function initializeFirebase(): FirebaseServices {
    if (firebaseApp) {
        return { firebaseApp, auth: auth!, firestore: firestore! };
    }

    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const newAuth = getAuth(app);
    const newFirestore = getFirestore(app);

    firebaseApp = app;
    auth = newAuth;
    firestore = newFirestore;

    return { firebaseApp: app, auth: newAuth, firestore: newFirestore };
}

type FirebaseClientProviderProps = {
  children: ReactNode;
};

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [services, setServices] = useState<FirebaseServices | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { firebaseApp, auth, firestore } = initializeFirebase();
    setServices({ firebaseApp, auth, firestore });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        signInAnonymously(auth).catch((error) => {
          console.error("Anonymous sign-in failed:", error);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const providerValue = useMemo(() => ({
    firebaseApp: services?.firebaseApp,
    auth: services?.auth,
    firestore: services?.firestore,
    user,
    areServicesAvailable: !!services,
  }), [services, user]);
  
  if (!services) {
    return (
      <div className="flex justify-center items-center h-screen">
          Yükleniyor...
      </div>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={services.firebaseApp}
      auth={services.auth}
      firestore={services.firestore}
      user={user}
    >
      {children}
    </FirebaseProvider>
  );
}
