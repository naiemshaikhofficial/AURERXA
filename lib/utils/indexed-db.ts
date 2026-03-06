/**
 * ELITE STORAGE: INDEXEDDB WRAPPER
 * Used for high-volume data (like product catalogs) that exceed localStorage limits.
 */

const DB_NAME = 'aurerxa-db';
const DB_VERSION = 1;
const STORE_NAME = 'swr-cache';

export async function openDB() {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function getCache() {
    const db = await openDB();
    return new Promise<Map<any, any>>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        const keysRequest = store.getAllKeys();

        request.onsuccess = () => {
            keysRequest.onsuccess = () => {
                const map = new Map();
                request.result.forEach((val, i) => {
                    map.set(keysRequest.result[i], val);
                });
                resolve(map);
            };
        };
        request.onerror = () => reject(request.error);
    });
}

export async function setCache(key: any, value: any) {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(value, key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function clearCache() {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).clear();
}
