import { getEffectiveDate } from '../utils/dateHelpers.js';

/**
 * Storage service for journal entries
 * Entry schema: { date: "YYYY-MM-DD", emotion: "joy" | null }
 */
export class StorageService {
  constructor() {
    this.db = null;
    this.DB_NAME = 'BurningJournal';
    this.DB_VERSION = 2; // Incremented for new schema
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

        // Delete old stores if they exist (migration from old app)
        if (db.objectStoreNames.contains('sessions')) {
          db.deleteObjectStore('sessions');
        }

        // Create entries store with date as key
        if (!db.objectStoreNames.contains('entries')) {
          db.createObjectStore('entries', { keyPath: 'date' });
        }

        // Create settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Save journal entry (date + optional emotion)
   * @param {string} date - YYYY-MM-DD format
   * @param {string|null} emotion - Emotion key or null
   */
  async saveEntry(date, emotion = null) {
    const tx = this.db.transaction(['entries'], 'readwrite');
    const store = tx.objectStore('entries');

    const entry = {
      date,
      emotion
    };

    await store.put(entry);
    return entry;
  }

  /**
   * Get entry for a specific date
   * @param {string} date - YYYY-MM-DD format
   * @returns {Promise<Object|null>}
   */
  async getEntry(date) {
    const tx = this.db.transaction(['entries'], 'readonly');
    const store = tx.objectStore('entries');
    const request = store.get(date);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get entry for today (accounting for 4am cutoff)
   * @returns {Promise<Object|null>}
   */
  async getTodaysEntry() {
    const today = getEffectiveDate();
    return this.getEntry(today);
  }

  /**
   * Check if user has journaled today
   * @returns {Promise<boolean>}
   */
  async hasJournaledToday() {
    const entry = await this.getTodaysEntry();
    return entry !== null;
  }

  /**
   * Get all entries
   * @returns {Promise<Array>}
   */
  async getAllEntries() {
    const tx = this.db.transaction(['entries'], 'readonly');
    const store = tx.objectStore('entries');
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get entries for a specific month
   * @param {number} year
   * @param {number} month - 0-11 (JavaScript month indexing)
   * @returns {Promise<Array>}
   */
  async getEntriesForMonth(year, month) {
    const allEntries = await this.getAllEntries();
    const targetMonth = month + 1; // Convert to 1-12

    return allEntries.filter(entry => {
      const [entryYear, entryMonth] = entry.date.split('-').map(Number);
      return entryYear === year && entryMonth === targetMonth;
    });
  }

  /**
   * Delete an entry
   * @param {string} date - YYYY-MM-DD format
   */
  async deleteEntry(date) {
    const tx = this.db.transaction(['entries'], 'readwrite');
    const store = tx.objectStore('entries');
    await store.delete(date);
  }

  /**
   * Clear all entries
   */
  async clearAllEntries() {
    const tx = this.db.transaction(['entries'], 'readwrite');
    const store = tx.objectStore('entries');
    await store.clear();
  }

  /**
   * Get a setting value
   * @param {string} key
   * @param {*} defaultValue
   * @returns {Promise<*>}
   */
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

  /**
   * Save a setting value
   * @param {string} key
   * @param {*} value
   */
  async saveSetting(key, value) {
    const tx = this.db.transaction(['settings'], 'readwrite');
    const store = tx.objectStore('settings');
    await store.put({ id: key, value });
  }

  /**
   * Delete a setting
   * @param {string} key
   */
  async deleteSetting(key) {
    const tx = this.db.transaction(['settings'], 'readwrite');
    const store = tx.objectStore('settings');
    await store.delete(key);
  }

  /**
   * Clear all settings
   */
  async clearAllSettings() {
    const tx = this.db.transaction(['settings'], 'readwrite');
    const store = tx.objectStore('settings');
    await store.clear();
  }

  /**
   * Export all data
   * @returns {Promise<Object>}
   */
  async exportData() {
    const entries = await this.getAllEntries();
    const settings = await this.getAllSettings();

    return {
      entries,
      settings,
      exportDate: new Date().toISOString(),
      version: this.DB_VERSION
    };
  }

  /**
   * Get all settings
   * @returns {Promise<Array>}
   */
  async getAllSettings() {
    const tx = this.db.transaction(['settings'], 'readonly');
    const store = tx.objectStore('settings');
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Import data
   * @param {Object} data
   * @param {Object} options
   * @returns {Promise<Object>} Stats about import
   */
  async importData(data, options = { merge: true }) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid import data');
    }

    const stats = {
      entriesImported: 0,
      settingsImported: 0,
      errors: []
    };

    // Import entries
    if (data.entries && Array.isArray(data.entries)) {
      for (const entry of data.entries) {
        try {
          if (!entry.date) {
            stats.errors.push('Skipped entry without date');
            continue;
          }

          if (!options.merge) {
            const existing = await this.getEntry(entry.date);
            if (existing) continue;
          }

          await this.saveEntry(entry.date, entry.emotion);
          stats.entriesImported++;
        } catch (error) {
          stats.errors.push(`Failed to import entry ${entry.date}: ${error.message}`);
        }
      }
    }

    // Import settings
    if (data.settings && Array.isArray(data.settings)) {
      for (const setting of data.settings) {
        try {
          if (!setting.id) {
            stats.errors.push('Skipped setting without ID');
            continue;
          }

          await this.saveSetting(setting.id, setting.value);
          stats.settingsImported++;
        } catch (error) {
          stats.errors.push(`Failed to import setting ${setting.id}: ${error.message}`);
        }
      }
    }

    return stats;
  }
}
