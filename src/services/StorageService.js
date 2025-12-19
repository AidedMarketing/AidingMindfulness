export class StorageService {
  constructor() {
    this.db = null;
    this.DB_NAME = 'AidingMindfulness';
    this.DB_VERSION = 1;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create sessions store
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionsStore.createIndex('timestamp', 'timestamp', { unique: false });
          sessionsStore.createIndex('emotion', 'moodBefore.emotion', { unique: false });
          sessionsStore.createIndex('technique', 'breathingTechnique', { unique: false });
        }

        // Create settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      };
    });
  }

  async saveSession(session) {
    const tx = this.db.transaction(['sessions'], 'readwrite');
    const store = tx.objectStore('sessions');

    // Generate ID if not present
    if (!session.id) {
      session.id = this.generateUUID();
    }

    // Add timestamp if not present
    if (!session.timestamp) {
      session.timestamp = new Date().toISOString();
    }

    await store.put(session);
    return session;
  }

  async getAllSessions() {
    const tx = this.db.transaction(['sessions'], 'readonly');
    const store = tx.objectStore('sessions');
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getSession(id) {
    const tx = this.db.transaction(['sessions'], 'readonly');
    const store = tx.objectStore('sessions');
    const request = store.get(id);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteSession(id) {
    const tx = this.db.transaction(['sessions'], 'readwrite');
    const store = tx.objectStore('sessions');
    await store.delete(id);
  }

  async getSessionsByDateRange(startDate, endDate) {
    const allSessions = await this.getAllSessions();
    return allSessions.filter(session => {
      const timestamp = new Date(session.timestamp);
      return timestamp >= startDate && timestamp <= endDate;
    });
  }

  async getSessionsForMonth(year, month) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);
    return this.getSessionsByDateRange(startDate, endDate);
  }

  async getSessionsForToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.getSessionsByDateRange(today, tomorrow);
  }

  async getSetting(key, defaultValue = null) {
    const tx = this.db.transaction(['settings'], 'readonly');
    const store = tx.objectStore('settings');
    const request = store.get(key);

    return new Promise((resolve) => {
      request.onsuccess = () => {
        resolve(request.result?.value ?? defaultValue);
      };
      request.onerror = () => resolve(defaultValue);
    });
  }

  async saveSetting(key, value) {
    const tx = this.db.transaction(['settings'], 'readwrite');
    const store = tx.objectStore('settings');
    await store.put({ id: key, value });
  }

  async deleteSetting(key) {
    const tx = this.db.transaction(['settings'], 'readwrite');
    const store = tx.objectStore('settings');
    await store.delete(key);
  }

  async clearAllSessions() {
    const tx = this.db.transaction(['sessions'], 'readwrite');
    const store = tx.objectStore('sessions');
    await store.clear();
  }

  async clearAllSettings() {
    const tx = this.db.transaction(['settings'], 'readwrite');
    const store = tx.objectStore('settings');
    await store.clear();
  }

  async exportData() {
    const sessions = await this.getAllSessions();
    const settings = await this.getAllSettings();
    return {
      sessions,
      settings,
      exportDate: new Date().toISOString(),
      version: this.DB_VERSION
    };
  }

  async getAllSettings() {
    const tx = this.db.transaction(['settings'], 'readonly');
    const store = tx.objectStore('settings');
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async importData(data) {
    // Import sessions
    if (data.sessions) {
      for (const session of data.sessions) {
        await this.saveSession(session);
      }
    }

    // Import settings
    if (data.settings) {
      for (const setting of data.settings) {
        await this.saveSetting(setting.id, setting.value);
      }
    }
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
