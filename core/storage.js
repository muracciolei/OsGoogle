/**
 * WebOS Storage Module
 * Handles persistent storage using IndexedDB with LocalStorage fallback
 */

const WebOSStorage = {
  db: null,
  dbName: 'WebOS_DB',
  version: 1,
  
  // Initialize IndexedDB
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
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized');
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('icons')) {
          db.createObjectStore('icons', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('widgets')) {
          db.createObjectStore('widgets', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        
        if (!db.objectStoreNames.contains('notes')) {
          db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('folders')) {
          db.createObjectStore('folders', { keyPath: 'id' });
        }
      };
    });
  },
  
  // Generic CRUD operations
  async get(storeName, key) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (e) {
        // Fallback to LocalStorage
        const data = JSON.parse(localStorage.getItem(`webos_${storeName}`) || '{}');
        resolve(data[key] || null);
      }
    });
  },
  
  async getAll(storeName) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      } catch (e) {
        // Fallback to LocalStorage
        const data = JSON.parse(localStorage.getItem(`webos_${storeName}`) || '[]');
        resolve(data);
      }
    });
  },
  
  async put(storeName, data) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (e) {
        // Fallback to LocalStorage
        const key = data.id || data.key || Date.now();
        const storeData = JSON.parse(localStorage.getItem(`webos_${storeName}`) || '{}');
        storeData[key] = data;
        localStorage.setItem(`webos_${storeName}`, JSON.stringify(storeData));
        resolve(key);
      }
    });
  },
  
  async delete(storeName, key) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (e) {
        // Fallback to LocalStorage
        const storeData = JSON.parse(localStorage.getItem(`webos_${storeName}`) || '{}');
        delete storeData[key];
        localStorage.setItem(`webos_${storeName}`, JSON.stringify(storeData));
        resolve();
      }
    });
  },
  
  async clear(storeName) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (e) {
        // Fallback to LocalStorage
        localStorage.removeItem(`webos_${storeName}`);
        resolve();
      }
    });
  },
  
  // Convenience methods for specific stores
  async getIcons() {
    return await this.getAll('icons');
  },
  
  async saveIcon(icon) {
    return await this.put('icons', icon);
  },
  
  async getWidgets() {
    return await this.getAll('widgets');
  },
  
  async saveWidget(widget) {
    return await this.put('widgets', widget);
  },
  
  async getSettings() {
    const settings = await this.getAll('settings');
    const settingsObj = {};
    settings.forEach(s => settingsObj[s.key] = s.value);
    return settingsObj;
  },
  
  async saveSetting(key, value) {
    return await this.put('settings', { key, value });
  },
  
  async getNotes() {
    return await this.getAll('notes');
  },
  
  async saveNote(note) {
    return await this.put('notes', note);
  },
  
  async deleteNote(id) {
    return await this.delete('notes', id);
  },
  
  async getFolders() {
    return await this.getAll('folders');
  },
  
  async saveFolder(folder) {
    return await this.put('folders', folder);
  },
  
  // Export/Import
  async exportData() {
    const data = {
      icons: await this.getIcons(),
      widgets: await this.getWidgets(),
      settings: await this.getSettings(),
      notes: await this.getNotes(),
      folders: await this.getFolders(),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  },
  
  async importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      
      if (data.icons) {
        await this.clear('icons');
        for (const icon of data.icons) {
          await this.put('icons', icon);
        }
      }
      
      if (data.widgets) {
        await this.clear('widgets');
        for (const widget of data.widgets) {
          await this.put('widgets', widget);
        }
      }
      
      if (data.settings) {
        for (const [key, value] of Object.entries(data.settings)) {
          await this.saveSetting(key, value);
        }
      }
      
      if (data.notes) {
        await this.clear('notes');
        for (const note of data.notes) {
          await this.put('notes', note);
        }
      }
      
      if (data.folders) {
        await this.clear('folders');
        for (const folder of data.folders) {
          await this.put('folders', folder);
        }
      }
      
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  },
  
  // Reset all data
  async resetAll() {
    await this.clear('icons');
    await this.clear('widgets');
    await this.clear('settings');
    await this.clear('notes');
    await this.clear('folders');
    localStorage.removeItem('webos_layout');
    console.log('All data reset');
  }
};

// Make it globally available
window.WebOSStorage = WebOSStorage;