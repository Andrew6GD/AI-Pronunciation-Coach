/**
 * 优化的音标服务
 * 集成CMU词典、ARPA到IPA映射和缓存机制
 */

import { getCMUPhonemes, hasCMUEntry, getCMUDictStats } from '../data/cmuHighFrequency.js';
import { ArpaToIpaMapper } from './arpaToIpaMapper.js';

class OptimizedPhoneticService {
  constructor() {
    this.arpaMapper = new ArpaToIpaMapper();
    this.cache = new Map();
    this.maxCacheSize = 1000;
    this.stats = {
      cmuHits: 0,
      cachehits: 0,
      fallbackUses: 0,
      totalQueries: 0
    };
  }

  /**
   * 获取单词的IPA音标
   * @param {string} word - 要查询的单词
   * @param {string} variant - 音标变体 ('american' | 'british')
   * @returns {string} - IPA音标
   */
  async getIPA(word, variant = 'american') {
    if (!word || typeof word !== 'string') {
      return '';
    }

    const normalizedWord = word.toLowerCase().trim();
    const cacheKey = `${normalizedWord}_${variant}`;
    
    this.stats.totalQueries++;

    // 1. 检查缓存
    if (this.cache.has(cacheKey)) {
      this.stats.cachehits++;
      return this.cache.get(cacheKey);
    }

    let ipa = '';

    // 2. 尝试从CMU词典获取ARPABET音标
    const arpaPhonemes = getCMUPhonemes(normalizedWord);
    if (arpaPhonemes) {
      this.stats.cmuHits++;
      // 转换ARPABET到IPA
      ipa = this.arpaMapper.convertToIPA(arpaPhonemes, variant);
    } else {
      // 3. 回退到eSpeak-NG或估算
      this.stats.fallbackUses++;
      ipa = await this.getFallbackIPA(normalizedWord, variant);
    }

    // 4. 缓存结果
    this.addToCache(cacheKey, ipa);

    return ipa;
  }

  /**
   * 回退音标生成方法
   * @param {string} word - 单词
   * @param {string} variant - 音标变体
   * @returns {string} - IPA音标
   */
  async getFallbackIPA(word, variant) {
    try {
      // 尝试使用eSpeak-NG
      if (typeof window !== 'undefined' && window.eSpeakService) {
        const espeak = window.eSpeakService;
        if (variant === 'british') {
          return await espeak.getBritishIPA(word);
        } else {
          return await espeak.textToIPA(word);
        }
      }
    } catch (error) {
      console.warn('eSpeak-NG fallback failed:', error);
    }

    // 最后的回退：基本估算
    return this.estimateIPA(word);
  }

  /**
   * 基本IPA估算（简化版）
   * @param {string} word - 单词
   * @returns {string} - 估算的IPA音标
   */
  estimateIPA(word) {
    // 基本的字母到IPA映射
    const basicMapping = {
      'a': 'æ', 'e': 'ɛ', 'i': 'ɪ', 'o': 'ɒ', 'u': 'ʌ',
      'b': 'b', 'c': 'k', 'd': 'd', 'f': 'f', 'g': 'g',
      'h': 'h', 'j': 'dʒ', 'k': 'k', 'l': 'l', 'm': 'm',
      'n': 'n', 'p': 'p', 'q': 'kw', 'r': 'r', 's': 's',
      't': 't', 'v': 'v', 'w': 'w', 'x': 'ks', 'y': 'j', 'z': 'z'
    };

    let ipa = '';
    for (let i = 0; i < word.length; i++) {
      const char = word[i].toLowerCase();
      ipa += basicMapping[char] || char;
    }

    return ipa;
  }

  /**
   * 添加到缓存
   * @param {string} key - 缓存键
   * @param {string} value - 缓存值
   */
  addToCache(key, value) {
    if (this.cache.size >= this.maxCacheSize) {
      // 删除最旧的条目
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  /**
   * 批量获取多个单词的IPA音标
   * @param {string[]} words - 单词数组
   * @param {string} variant - 音标变体
   * @returns {Promise<Object>} - 单词到IPA的映射
   */
  async getBatchIPA(words, variant = 'american') {
    const results = {};
    const promises = words.map(async (word) => {
      const ipa = await this.getIPA(word, variant);
      results[word] = ipa;
    });
    
    await Promise.all(promises);
    return results;
  }

  /**
   * 检查单词是否在CMU词典中
   * @param {string} word - 单词
   * @returns {boolean} - 是否在词典中
   */
  isInCMUDict(word) {
    return hasCMUEntry(word);
  }

  /**
   * 获取服务统计信息
   * @returns {Object} - 统计信息
   */
  getStats() {
    const cmuStats = getCMUDictStats();
    return {
      ...this.stats,
      cacheSize: this.cache.size,
      maxCacheSize: this.maxCacheSize,
      cmuDict: cmuStats,
      hitRate: {
        cache: this.stats.totalQueries > 0 ? (this.stats.cachehits / this.stats.totalQueries * 100).toFixed(2) + '%' : '0%',
        cmu: this.stats.totalQueries > 0 ? (this.stats.cmuHits / this.stats.totalQueries * 100).toFixed(2) + '%' : '0%'
      }
    };
  }

  /**
   * 清空缓存
   */
  clearCache() {
    this.cache.clear();
    this.stats.cachehits = 0;
  }

  /**
   * 重置统计信息
   */
  resetStats() {
    this.stats = {
      cmuHits: 0,
      cachehits: 0,
      fallbackUses: 0,
      totalQueries: 0
    };
  }

  /**
   * 预热缓存 - 预加载常用单词
   * @param {string[]} commonWords - 常用单词列表
   * @param {string} variant - 音标变体
   */
  async warmupCache(commonWords, variant = 'american') {
    console.log('Warming up phonetic cache...');
    const batchSize = 50;
    
    for (let i = 0; i < commonWords.length; i += batchSize) {
      const batch = commonWords.slice(i, i + batchSize);
      await this.getBatchIPA(batch, variant);
      
      // 避免阻塞UI
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    console.log(`Cache warmed up with ${commonWords.length} words`);
  }

  /**
   * 获取单词的音节数估算
   * @param {string} word - 单词
   * @returns {number} - 估算的音节数
   */
  estimateSyllables(word) {
    if (!word) return 0;
    
    // 简单的音节计算规则
    const vowels = 'aeiouy';
    let syllables = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const char = word[i].toLowerCase();
      const isVowel = vowels.includes(char);
      
      if (isVowel && !previousWasVowel) {
        syllables++;
      }
      
      previousWasVowel = isVowel;
    }
    
    // 处理silent e
    if (word.toLowerCase().endsWith('e') && syllables > 1) {
      syllables--;
    }
    
    return Math.max(1, syllables);
  }

  /**
   * 获取单词的重音模式
   * @param {string} word - 单词
   * @returns {string} - 重音模式描述
   */
  getStressPattern(word) {
    const arpaPhonemes = getCMUPhonemes(word.toLowerCase());
    if (arpaPhonemes) {
      return this.arpaMapper.getStressPattern(arpaPhonemes);
    }
    
    // 简单的重音规则估算
    const syllableCount = this.estimateSyllables(word);
    if (syllableCount === 1) {
      return 'primary';
    } else if (syllableCount === 2) {
      return 'primary-secondary';
    } else {
      return 'primary-secondary-unstressed';
    }
  }
}

// 创建单例实例
const optimizedPhoneticService = new OptimizedPhoneticService();

export default optimizedPhoneticService;
export { OptimizedPhoneticService };