import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { iPhoneProduct } from '../types';

export type SyncStatus = 'syncing' | 'live' | 'empty' | 'error';

interface UseProductsOptions {
  includeInactive?: boolean;
}

/**
 * Productos en tiempo real desde Firestore (colección `products`).
 * Sin datos mock: si no hay productos o falla la conexión, devuelve lista vacía.
 * En la tienda pública solo se muestran los activos con stock disponible.
 */
export function useProducts(options: UseProductsOptions = {}) {
  const { includeInactive = false } = options;
  const [products, setProducts] = useState<iPhoneProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('syncing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const list: iPhoneProduct[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as iPhoneProduct;
          const visible = data.active !== false && (data.stock === undefined || data.stock > 0);
          if (includeInactive || visible) list.push({ ...data, id: docSnap.id });
        });
        setProducts(list);
        setSyncStatus(list.length > 0 ? 'live' : 'empty');
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('[useProducts] Error leyendo Firestore:', err);
        setProducts([]);
        setSyncStatus('error');
        setIsLoading(false);
        setError(err.message);
      }
    );
    return () => unsubscribe();
  }, [includeInactive]);

  return { products, isLoading, syncStatus, error };
}
