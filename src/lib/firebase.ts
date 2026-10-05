import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "thorcitostore.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "thorcitostore",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "thorcitostore.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "820436132297",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:820436132297:web:f0dce426dfc7db23604818",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-0G0XM09HCZ"
};

// Singleton pattern to prevent re-initialization during Vite HMR
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Authoritative Firestore Rules Guidance for Development
export const FIRESTORE_RULES_GUIDANCE =
  "Reglas de Firestore: Si experimentas errores de permisos ('insufficient permissions'), ve a Firebase Console -> Firestore Database -> Reglas y coloca: `rules_version = '2'; service cloud.firestore { match /databases/{database}/documents { match /{document=**} { allow read, write: if true; } } }` durante desarrollo.";

/**
 * Checks if an error is a Firebase Firestore permission-denied / insufficient permissions exception
 */
export function isFirestorePermissionError(error: any): boolean {
  if (!error) return false;
  const errStr = (error.code || error.message || String(error)).toLowerCase();
  return (
    errStr.includes('permission-denied') ||
    errStr.includes('insufficient permissions') ||
    errStr.includes('missing or insufficient permissions') ||
    error.code === 'permission-denied'
  );
}

/**
 * Formats a Firestore error message gracefully, displaying exact guidance on permission denied
 */
export function handleFirestoreError(error: any, fallbackMessage: string = 'Error de Firestore'): string {
  if (isFirestorePermissionError(error)) {
    console.warn('[Firestore Permission Denied]', FIRESTORE_RULES_GUIDANCE);
    return FIRESTORE_RULES_GUIDANCE;
  }
  return error?.message || fallbackMessage;
}
