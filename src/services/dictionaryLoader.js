/**
 * 词典懒加载管理器
 * 实现按首字母分块的词典加载机制
 */

import { cmuDictService } from './cmuDictService.js';
import arpaToIpaMapper from '../data/arpaToIpaMapper.js';
import { getBritishException, applyBritishRules } from '../data/britishExceptions.js';

/**
 * 词典分块配置
 */
const CHUNK_CONFIG = {
  // 按首字母分组
  chunks: {
    'a': ['a'],
    'b': ['b'],
    'c': ['c'],
    'd': ['d'],
    'e': ['e'],
    'f': ['f'],
    'g': ['g'],
    'h': ['h'],
    'i': ['i'],
    'j-k': ['j', 'k'],
    'l': ['l'],
    'm': ['m'],
    'n': ['n'],
    'o': ['o'],
    'p': ['p'],
    'q-r': ['q', 'r'],
    's': ['s'],
    't': ['t'],
    'u-v': ['u', 'v'],
    'w-z': ['w', 'x', 'y', 'z']
  },
  
  // 预加载的高频字母
  preloadChunks: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 's', 't'],
  
  // 缓存配置
  maxCacheSize: 50000, // 最大缓存词条数
  cacheTimeout: 30 * 60 * 1000, // 30分钟缓存过期
};

/**
 * 词典加载器类
 */
class DictionaryLoader {
  constructor() {
    this.loadedChunks = new Set();
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    this.loadingPromises = new Map();
    this.stats = {
      totalQueries: 0,
      cacheHits: 0,
      chunkLoads: 0,
      fallbackUses: 0
    };
    
    // 初始化时预加载高频分块
    this.preloadHighFrequencyChunks();
  }
  
  /**
   * 预加载高频字母分块
   */
  async preloadHighFrequencyChunks() {
    try {
      const preloadPromises = CHUNK_CONFIG.preloadChunks.map(letter => 
        cmuDictService.preloadChunk(letter)
      );
      await Promise.all(preloadPromises);
      console.log('High frequency chunks preloaded successfully');
    } catch (error) {
      console.warn('Failed to preload some chunks:', error);
    }
  }
  
  /**
   * 获取单词的首字母对应的分块名
   * @param {string} word - 单词
   * @returns {string} - 分块名
   */
  getChunkForWord(word) {
    const firstLetter = word.toLowerCase().charAt(0);
    
    for (const [chunkName, letters] of Object.entries(CHUNK_CONFIG.chunks)) {
      if (letters.includes(firstLetter)) {
        return chunkName;
      }
    }
    
    return 'w-z'; // 默认分块
  }
  
  /**
   * 为指定字母加载对应分块
   * @param {string} letter - 字母
   * @returns {Promise<void>}
   */
  async loadChunkForLetter(letter) {
    const chunkName = this.getChunkForWord(letter);
    return this.loadChunk(chunkName);
  }
  
  /**
   * 加载指定分块
   * @param {string} chunkName - 分块名
   * @returns {Promise<void>}
   */
  async loadChunk(chunkName) {
    if (this.loadedChunks.has(chunkName)) {
      return; // 已加载
    }
    
    // 如果正在加载，返回现有的Promise
    if (this.loadingPromises.has(chunkName)) {
      return this.loadingPromises.get(chunkName);
    }
    
    const loadingPromise = this._loadChunkData(chunkName);
    this.loadingPromises.set(chunkName, loadingPromise);
    
    try {
      await loadingPromise;
      this.loadedChunks.add(chunkName);
      this.stats.chunkLoads++;
      console.log(`Chunk '${chunkName}' loaded successfully`);
    } catch (error) {
      console.error(`Failed to load chunk '${chunkName}':`, error);
    } finally {
      this.loadingPromises.delete(chunkName);
    }
  }
  
  /**
   * 实际加载分块数据
   * @param {string} chunkName - 分块名
   * @returns {Promise<void>}
   */
  async _loadChunkData(chunkName) {
    // 模拟异步加载过程
    // 在实际实现中，这里会从服务器或本地文件加载数据
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Loading chunk: ${chunkName}`);
        resolve();
      }, 100); // 模拟网络延迟
    });
  }
  
  /**
   * 获取单词的音标
   * @param {string} word - 单词
   * @param {object} options - 选项
   * @returns {Promise<object>} - 音标结果
   */
  async getPhonetics(word, options = {}) {
    const {
      accent = 'american', // 'american' | 'british'
      useCache = true,
      fallbackToEspeak = true
    } = options;
    
    this.stats.totalQueries++;
    
    const normalizedWord = word.toLowerCase().trim();
    const cacheKey = `${normalizedWord}_${accent}`;
    
    // 检查缓存
    if (useCache && this._getCachedResult(cacheKey)) {
      this.stats.cacheHits++;
      return this._getCachedResult(cacheKey);
    }
    
    try {
      // 确保对应分块已加载
      const chunkName = this.getChunkForWord(normalizedWord);
      await this.loadChunk(chunkName);
      
      // 获取音标
      const result = await this._getPhoneticResult(normalizedWord, accent, fallbackToEspeak);
      
      // 缓存结果
      if (useCache && result.success) {
        this._setCachedResult(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      console.error('Error getting phonetics:', error);
      return {
        success: false,
        word: normalizedWord,
        error: error.message
      };
    }
  }
  
  /**
   * 获取音标结果
   * @param {string} word - 单词
   * @param {string} accent - 口音
   * @param {boolean} fallbackToEspeak - 是否回退到eSpeak
   * @returns {Promise<object>} - 音标结果
   */
  async _getPhoneticResult(word, accent, fallbackToEspeak) {
    // 1. 检查英式发音例外
    if (accent === 'british') {
      const britishException = getBritishException(word);
      if (britishException) {
        return {
          success: true,
          word,
          ipa: britishException,
          source: 'british_exceptions',
          accent
        };
      }
    }
    
    // 2. 查询CMU词典
    const arpaPhonemes = await cmuDictService.getPhonemes(word);
    if (arpaPhonemes) {
      let ipa = arpaToIpaMapper.convertToIPA(arpaPhonemes, accent);
      
      // 应用英式发音规则
      if (accent === 'british') {
        ipa = applyBritishRules(ipa, word);
      }
      
      return {
        success: true,
        word,
        ipa,
        arpa: arpaPhonemes,
        source: 'cmu_dict',
        accent
      };
    }
    
    // 3. 回退到eSpeak-NG
    if (fallbackToEspeak) {
      try {
        const eSpeakResult = await this._getESpeakPhonetics(word, accent);
        if (eSpeakResult.success) {
          this.stats.fallbackUses++;
          return {
            ...eSpeakResult,
            source: 'espeak_fallback'
          };
        }
      } catch (error) {
        console.warn('eSpeak fallback failed:', error);
      }
    }
    
    // 4. 无法获取音标
    return {
      success: false,
      word,
      error: 'No phonetic data available',
      accent
    };
  }
  
  /**
   * 使用eSpeak获取音标（回退方案）
   * @param {string} word - 单词
   * @param {string} accent - 口音
   * @returns {Promise<object>} - 音标结果
   */
  async _getESpeakPhonetics(word, accent) {
    // 这里会调用现有的eSpeakService
    // 为了避免循环依赖，使用动态导入
    try {
      const { eSpeakService } = await import('./eSpeakService.js');
      const ipa = await eSpeakService.textToIPA(word);
      
      return {
        success: true,
        word,
        ipa,
        accent
      };
    } catch (error) {
      return {
        success: false,
        word,
        error: error.message,
        accent
      };
    }
  }
  
  /**
   * 获取缓存结果
   * @param {string} key - 缓存键
   * @returns {object|null} - 缓存结果
   */
  _getCachedResult(key) {
    if (!this.cache.has(key)) {
      return null;
    }
    
    const timestamp = this.cacheTimestamps.get(key);
    if (Date.now() - timestamp > CHUNK_CONFIG.cacheTimeout) {
      // 缓存过期
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
      return null;
    }
    
    return this.cache.get(key);
  }
  
  /**
   * 设置缓存结果
   * @param {string} key - 缓存键
   * @param {object} result - 结果
   */
  _setCachedResult(key, result) {
    // 检查缓存大小限制
    if (this.cache.size >= CHUNK_CONFIG.maxCacheSize) {
      this._evictOldestCache();
    }
    
    this.cache.set(key, result);
    this.cacheTimestamps.set(key, Date.now());
  }
  
  /**
   * 清理最旧的缓存项
   */
  _evictOldestCache() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, timestamp] of this.cacheTimestamps.entries()) {
      if (timestamp < oldestTime) {
        oldestTime = timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.cacheTimestamps.delete(oldestKey);
    }
  }
  
  /**
   * 批量预加载单词
   * @param {string[]} words - 单词列表
   * @param {object} options - 选项
   * @returns {Promise<object[]>} - 结果列表
   */
  async preloadWords(words, options = {}) {
    const results = [];
    const batchSize = 50; // 批处理大小
    
    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, i + batchSize);
      const batchPromises = batch.map(word => this.getPhonetics(word, options));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // 避免阻塞UI
      if (i + batchSize < words.length) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    return results;
  }
  
  /**
   * 清理缓存
   * @param {boolean} force - 是否强制清理所有缓存
   */
  clearCache(force = false) {
    if (force) {
      this.cache.clear();
      this.cacheTimestamps.clear();
    } else {
      // 只清理过期缓存
      const now = Date.now();
      for (const [key, timestamp] of this.cacheTimestamps.entries()) {
        if (now - timestamp > CHUNK_CONFIG.cacheTimeout) {
          this.cache.delete(key);
          this.cacheTimestamps.delete(key);
        }
      }
    }
  }
  
  /**
   * 获取加载器统计信息
   * @returns {object} - 统计信息
   */
  getStats() {
    const cacheHitRate = this.stats.totalQueries > 0 
      ? (this.stats.cacheHits / this.stats.totalQueries * 100).toFixed(2)
      : '0.00';
    
    return {
      ...this.stats,
      cacheHitRate: `${cacheHitRate}%`,
      loadedChunks: Array.from(this.loadedChunks),
      cacheSize: this.cache.size,
      memoryUsage: {
        cacheEntries: this.cache.size,
        loadedChunks: this.loadedChunks.size,
        pendingLoads: this.loadingPromises.size
      }
    };
  }
  
  /**
   * 重置统计信息
   */
  resetStats() {
    this.stats = {
      totalQueries: 0,
      cacheHits: 0,
      chunkLoads: 0,
      fallbackUses: 0
    };
  }
}

// 创建全局实例
export const dictionaryLoader = new DictionaryLoader();

// 导出类以供测试使用
export { DictionaryLoader };

// 便捷方法
export async function getWordPhonetics(word, options = {}) {
  return dictionaryLoader.getPhonetics(word, options);
}

export function getDictionaryStats() {
  return dictionaryLoader.getStats();
}

export function clearDictionaryCache(force = false) {
  return dictionaryLoader.clearCache(force);
}