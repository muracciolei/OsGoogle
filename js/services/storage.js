/**
 * Storage Service
 * Handles persistent storage using IndexedDB with LocalStorage fallback
 */

const StorageService = {
  db: null,
  dbName: 'JoeyGoogle_DB',
  version: 1,

  async init() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn('IndexedDB not supported, using LocalStorage');
        resolve();
        return;
      }

      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        resolve();
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('shortcuts')) {
          db.createObjectStore('shortcuts', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  },

  async getAll(storeName) {
    if (!this.db) await this.init();

    return new Promise((resolve) => {
      try {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result || []);
        };
        request.onerror = () => resolve([]);
      } catch (e) {
        const data = JSON.parse(localStorage.getItem(`joeygoogle_${storeName}`) || '[]');
        resolve(data);
      }
    });
  },

  async put(storeName, data) {
    if (!this.db) await this.init();

    return new Promise((resolve) => {
      try {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        store.put(data);
        transaction.oncomplete = () => resolve(data.id);
      } catch (e) {
        const key = data.id || Date.now();
        const storeData = JSON.parse(localStorage.getItem(`joeygoogle_${storeName}`) || '[]');
        const existingIndex = storeData.findIndex(item => item.id === data.id);
        if (existingIndex >= 0) {
          storeData[existingIndex] = data;
        } else {
          storeData.push(data);
        }
        localStorage.setItem(`joeygoogle_${storeName}`, JSON.stringify(storeData));
        resolve(key);
      }
    });
  },

  async delete(storeName, id) {
    if (!this.db) await this.init();

    return new Promise((resolve) => {
      try {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        store.delete(id);
        transaction.oncomplete = () => resolve();
      } catch (e) {
        const storeData = JSON.parse(localStorage.getItem(`joeygoogle_${storeName}`) || '[]');
        const filtered = storeData.filter(item => item.id !== id);
        localStorage.setItem(`joeygoogle_${storeName}`, JSON.stringify(filtered));
        resolve();
      }
    });
  },

  async getSetting(key) {
    const settings = await this.getAll('settings');
    const setting = settings.find(s => s.key === key);
    return setting ? setting.value : null;
  },

  async saveSetting(key, value) {
    return await this.put('settings', { key, value });
  },

  async getShortcuts() {
    return await this.getAll('shortcuts');
  },

  async saveShortcut(shortcut) {
    if (!shortcut.id) {
      shortcut.id = Date.now().toString();
    }
    return await this.put('shortcuts', shortcut);
  },

  async deleteShortcut(id) {
    return await this.delete('shortcuts', id);
  }
};

window.StorageService = StorageService;