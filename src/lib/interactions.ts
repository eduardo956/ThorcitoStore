import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { StoreInteraction } from '../types';

/**
 * Non-blocking interaction logger for Thorcito Store / Jorgito Store.
 * Records WhatsApp checkout leads and cart conversions to Firestore 'interactions' collection.
 */
export async function logStoreInteraction(
  payload: Omit<StoreInteraction, 'id' | 'timestamp'>
): Promise<string | null> {
  try {
    const colRef = collection(db, 'interactions');
    const docRef = await addDoc(colRef, {
      ...payload,
      status: payload.status || 'pending',
      timestamp: serverTimestamp(),
      createdAtIso: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    });
    return docRef.id;
  } catch (error) {
    // Graceful catch ensures customer redirection to WhatsApp is never disrupted
    console.warn('[logStoreInteraction] Failed to log interaction in Firestore:', error);
    return null;
  }
}
