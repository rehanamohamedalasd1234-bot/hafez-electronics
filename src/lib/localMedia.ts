import { useEffect, useState } from 'react';

const DATABASE_NAME = 'hafez-electronics-local-media';
const STORE_NAME = 'assets';
const LOCAL_MEDIA_PREFIX = 'local-media:';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('تعذر فتح التخزين المحلي.'));
    request.onblocked = () => reject(new Error('التخزين المحلي مشغول في نافذة أخرى.'));
  });
}

function waitForTransaction(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('تعذر حفظ الملف.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('تم إلغاء حفظ الملف.'));
  });
}

export function isLocalMediaReference(value: string) {
  return value.startsWith(LOCAL_MEDIA_PREFIX);
}

export async function saveLocalMedia(file: File): Promise<string> {
  const database = await openDatabase();
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const transaction = database.transaction(STORE_NAME, 'readwrite');
  const saved = waitForTransaction(transaction);
  transaction.objectStore(STORE_NAME).put(file, id);

  try {
    await saved;
  } finally {
    database.close();
  }

  return `${LOCAL_MEDIA_PREFIX}${id}`;
}

export async function deleteLocalMedia(reference: string): Promise<void> {
  if (!isLocalMediaReference(reference)) return;

  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, 'readwrite');
  const saved = waitForTransaction(transaction);
  transaction.objectStore(STORE_NAME).delete(reference.slice(LOCAL_MEDIA_PREFIX.length));

  try {
    await saved;
  } finally {
    database.close();
  }
}

async function readLocalMedia(reference: string): Promise<Blob | null> {
  if (!isLocalMediaReference(reference)) return null;

  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, 'readonly');
  const request = transaction.objectStore(STORE_NAME).get(reference.slice(LOCAL_MEDIA_PREFIX.length));
  const result = await new Promise<Blob | null>((resolve, reject) => {
    request.onsuccess = () => resolve((request.result as Blob | undefined) ?? null);
    request.onerror = () => reject(request.error ?? new Error('تعذر قراءة الملف.'));
  });
  database.close();
  return result;
}

export function useResolvedMediaUrl(reference: string) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (!isLocalMediaReference(reference)) {
      setUrl(reference);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;
    setUrl('');

    void readLocalMedia(reference)
      .then((blob) => {
        if (!blob || cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setUrl('');
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [reference]);

  return url;
}
