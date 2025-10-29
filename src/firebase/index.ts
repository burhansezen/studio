import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

/**
 * Initializes and returns Firebase services.
 * It ensures that Firebase is initialized only once.
 */
export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} {
  // Check if Firebase has already been initialized.
  const apps = getApps();
  const existingApp = apps.length > 0 ? apps[0] : null;

  if (existingApp) {
    // If an app instance already exists, return its services.
    const auth = getAuth(existingApp);
    const firestore = getFirestore(existingApp);
    return { firebaseApp: existingApp, auth, firestore };
  }

  // If no app instance exists, initialize a new one.
  const firebaseApp = initializeApp(firebaseConfig);
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  return { firebaseApp, auth, firestore };
}

export {
  addDocumentNonBlocking,
  setDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from './non-blocking-updates';
