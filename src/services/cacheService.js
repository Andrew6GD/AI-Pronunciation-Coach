/**
 * IndexedDB缓存服务
 * 提供持久化的音标查询结果缓存
 */

/**
 * 缓存配置
 */
const CACHE_CONFIG = {
  dbName: 'PhoneticCache',
  dbVersion: 1,
  storeName: 'phonetics',
  maxEntries: 100000, // 最大缓存条目数
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7天过期时间
  cleanupInterval: 24 * 60 * 60 * 1000, // 24小时清理间隔
};

/**
 * IndexedDB缓存服务类
 */
class CacheService {
  constructor() {
    this.db = null;
    this.isReady = false;
    this.initPromise = null;
    this.stats = {
      hits: 0,
      misses: 0,
      writes: 0,
      deletes: 0,
      errors: 0
    };
    
    // 启动清理定时器
    this.startCleanupTimer();
  }
  
  /**
   * 初始化数据库
   * @returns {Promise<void>}
   */
  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }
    
    this.initPromise = this._initDB();
    return this.initPromise;
  }

  /**
   * 初始化方法别名
   * @returns {Promise<void>}
   */
  async initialize() {
    return this.init();
  }
  
  /**
   * 内部数据库初始化
   * @returns {Promise<void>}
   */
  _initDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }
      
      const request = indexedDB.open(CACHE_CONFIG.dbName, CACHE_CONFIG.dbVersion);
      
      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        this.isReady = true;
        console.log('Phonetic cache database initialized');
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // 创建对象存储
        if (!db.objectStoreNames.contains(CACHE_CONFIG.storeName)) {
          const store = db.createObjectStore(CACHE_CONFIG.storeName, {
            keyPath: 'key'
          });
          
          // 创建索引
          store.createIndex('word', 'word', { unique: false });
          store.createIndex('accent', 'accent', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('source', 'source', { unique: false });
        }
      };
    });
  }
  
  /**
   * 生成缓存键
   * @param {string} word - 单词
   * @param {string} accent - 口音
   * @returns {string} - 缓存键
   */
  _generateKey(word, accent = 'american') {
    return `${word.toLowerCase().trim()}_${accent}`;
  }
  
  /**
   * 获取缓存结果
   * @param {string} word - 单词
   * @param {string} accent - 口音
   * @returns {Promise<object|null>} - 缓存结果
   */
  async get(word, accent = 'american') {
    try {
      await this.init();
      
      const key = this._generateKey(word, accent);
      const transaction = this.db.transaction([CACHE_CONFIG.storeName], 'readonly');
      const store = transaction.objectStore(CACHE_CONFIG.storeName);
      const request = store.get(key);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const result = request.result;
          
          if (!result) {
            this.stats.misses++;
            resolve(null);
            return;
          }
          
          // 检查是否过期
          if (Date.now() - result.timestamp > CACHE_CONFIG.maxAge) {
            this.stats.misses++;
            // 异步删除过期条目
            this.delete(word, accent).catch(console.error);
            resolve(null);
            return;
          }
          
          this.stats.hits++;
          resolve(result.data);
        };
        
        request.onerror = () => {
          this.stats.errors++;
          reject(new Error('Failed to get cache entry'));
        };
      });
    } catch (error) {
      this.stats.errors++;
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  /**
   * 设置缓存结果
   * @param {string} word - 单词
   * @param {string} accent - 口音
   * @param {object} data - 缓存数据
   * @returns {Promise<boolean>} - 是否成功
   */
  async set(word, accent = 'american', data) {
    try {
      await this.init();
      
      const key = this._generateKey(word, accent);
      const entry = {
        key,
        word: word.toLowerCase().trim(),
        accent,
        data,
        timestamp: Date.now()
      };
      
      const transaction = this.db.transaction([CACHE_CONFIG.storeName], 'readwrite');
      const store = transaction.objectStore(CACHE_CONFIG.storeName);
      const request = store.put(entry);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          this.stats.writes++;
          resolve(true);
        };
        
        request.onerror = () => {
          this.stats.errors++;
          reject(new Error('Failed to set cache entry'));
        };
      });
    } catch (error) {
      this.stats.errors++;
      console.error('Cache set error:', error);
      return false;
    }
  }
  
  /**
   * 删除缓存条目
   * @param {string} word - 单词
   * @param {string} accent - 口音
   * @returns {Promise<boolean>} - 是否成功
   */
  async delete(word, accent = 'american') {
    try {
      await this.init();
      
      const key = this._generateKey(word, accent);
      const transaction = this.db.transaction([CACHE_CONFIG.storeName], 'readwrite');
      const store = transaction.objectStore(CACHE_CONFIG.storeName);
      const request = store.delete(key);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          this.stats.deletes++;
          resolve(true);
        };
        
        request.onerror = () => {
          this.stats.errors++;
          reject(new Error('Failed to delete cache entry'));
        };
      });
    } catch (error) {
      this.stats.errors++;
      console.error('Cache delete error:', error);
      return false;
    }
  }
  
  /**
   * 批量设置缓存
   * @param {Array} entries - 缓存条目数组 [{word, accent, data}]
   * @returns {Promise<number>} - 成功设置的条目数
   */
  async setBatch(entries) {
    try {
      await this.init();
      
      const transaction = this.db.transaction([CACHE_CONFIG.storeName], 'readwrite');
      const store = transaction.objectStore(CACHE_CONFIG.storeName);
      let successCount = 0;
      
      const promises = entries.map(({ word, accent = 'american', data }) => {
        const key = this._generateKey(word, accent);
        const entry = {
          key,
          word: word.toLowerCase().trim(),
          accent,
          data,
          timestamp: Date.now()
        };
        
        return new Promise((resolve) => {
          const request = store.put(entry);
          request.onsuccess = () => {
            successCount++;
            resolve();
          };
          request.onerror = () => {
            this.stats.errors++;
            resolve();
          };
        });
      });
      
      await Promise.all(promises);
      this.stats.writes += successCount;
      return successCount;
    } catch (error) {
      this.stats.errors++;
      console.error('Cache batch set error:', error);
      return 0;
    }
  }
  
  /**
   * 清理过期缓存
   * @returns {Promise<number>} - 清理的条目数
   */
  async cleanup() {
    try {
      await this.init();
      
      const transaction = this.db.transaction([CACHE_CONFIG.storeName], 'readwrite');
      const store = transaction.objectStore(CACHE_CONFIG.storeName);
      const index = store.index('timestamp');
      
      const cutoffTime = Date.now() - CACHE_CONFIG.maxAge;
      const range = IDBKeyRange.upperBound(cutoffTime);
      
      let deletedCount = 0;
      
      return new Promise((resolve, reject) => {
        const request = index.openCursor(range);
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            deletedCount++;
            cursor.continue();
          } else {
            this.stats.deletes += deletedCount;
            console.log(`Cleaned up ${deletedCount} expired cache entries`);
            resolve(deletedCount);
          }
        };
        
        request.onerror = () => {
          this.stats.errors++;
          reject(new Error('Failed to cleanup cache'));
        };
      });
    } catch (error) {
      this.stats.errors++;
      console.error('Cache cleanup error:', error);
      return 0;
    }
  }
  
  /**
   * 清空所有缓存
   * @returns {Promise<boolean>} - 是否成功
   */
  async clear() {
    try {
      await this.init();
      
      const transaction = this.db.transaction([CACHE_CONFIG.storeName], 'readwrite');
      const store = transaction.objectStore(CACHE_CONFIG.storeName);
      const request = store.clear();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log('Cache cleared successfully');
          resolve(true);
        };
        
        request.onerror = () => {
          this.stats.errors++;
          reject(new Error('Failed to clear cache'));
        };
      });
    } catch (error) {
      this.stats.errors++;
      console.error('Cache clear error:', error);
      return false;
    }
  }
  
  /**
   * 获取缓存统计信息
   * @returns {Promise<object>} - 统计信息
   */
  async getStats() {
    try {
      await this.init();
      
      const transaction = this.db.transaction([CACHE_CONFIG.storeName], 'readonly');
      const store = transaction.objectStore(CACHE_CONFIG.storeName);
      
      const countRequest = store.count();
      const sizeEstimate = await this._estimateSize();
      
      return new Promise((resolve, reject) => {
        countRequest.onsuccess = () => {
          const totalEntries = countRequest.result;
          const hitRate = this.stats.hits + this.stats.misses > 0
            ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
            : '0.00';
          
          resolve({
            ...this.stats,
            hitRate: `${hitRate}%`,
            totalEntries,
            estimatedSize: sizeEstimate,
            maxEntries: CACHE_CONFIG.maxEntries,
            maxAge: CACHE_CONFIG.maxAge,
            isReady: this.isReady
          });
        };
        
        countRequest.onerror = () => {
          reject(new Error('Failed to get cache stats'));
        };
      });
    } catch (error) {
      console.error('Cache stats error:', error);
      return {
        ...this.stats,
        error: error.message,
        isReady: this.isReady
      };
    }
  }
  
  /**
   * 估算缓存大小
   * @returns {Promise<string>} - 估算大小
   */
  async _estimateSize() {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const usedMB = (estimate.usage / 1024 / 1024).toFixed(2);
        const quotaMB = (estimate.quota / 1024 / 1024).toFixed(2);
        return `${usedMB}MB / ${quotaMB}MB`;
      }
      return 'Unknown';
    } catch (error) {
      return 'Unknown';
    }
  }
  
  /**
   * 启动清理定时器
   */
  startCleanupTimer() {
    setInterval(() => {
      this.cleanup().catch(console.error);
    }, CACHE_CONFIG.cleanupInterval);
  }
  
  /**
   * 检查缓存是否可用
   * @returns {boolean} - 是否可用
   */
  isAvailable() {
    return !!window.indexedDB && this.isReady;
  }
  
  /**
   * 重置统计信息
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      writes: 0,
      deletes: 0,
      errors: 0
    };
  }
}

// 创建全局实例
export const cacheService = new CacheService();

// 导出类以供测试使用
export { CacheService };

// 便捷方法
export async function getCachedPhonetics(word, accent = 'american') {
  return cacheService.get(word, accent);
}

export async function setCachedPhonetics(word, accent = 'american', data) {
  return cacheService.set(word, accent, data);
}

export async function setBatchCachedPhonetics(entries) {
  return cacheService.setBatch(entries);
}

export async function clearPhoneticCache() {
  return cacheService.clear();
}

export async function getPhoneticCacheStats() {
  return cacheService.getStats();
}

export function isPhoneticCacheAvailable() {
  return cacheService.isAvailable();
}