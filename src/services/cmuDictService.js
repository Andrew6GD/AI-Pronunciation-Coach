// 完整CMU词典服务
// 支持126k+词汇的懒加载和高效查询

import { CMU_STATS, AVAILABLE_CHUNKS, loadChunk } from '../data/cmu/index.js';

class CMUDictService {
  constructor() {
    this.loadedChunks = new Map();
    this.stats = CMU_STATS;
    this.availableChunks = AVAILABLE_CHUNKS;
  }

  // 获取词典统计信息
  getStats() {
    return {
      ...this.stats,
      loadedChunks: this.loadedChunks.size,
      availableChunks: this.availableChunks.length
    };
  }

  // 预加载指定字母的词典块
  async preloadChunk(letter) {
    const normalizedLetter = letter.toLowerCase();
    
    if (this.loadedChunks.has(normalizedLetter)) {
      return true;
    }

    if (!this.availableChunks.includes(normalizedLetter)) {
      return false;
    }

    try {
      const chunk = await loadChunk(normalizedLetter);
      this.loadedChunks.set(normalizedLetter, chunk);
      return true;
    } catch (error) {
      console.warn(`Failed to preload chunk for letter ${letter}:`, error);
      return false;
    }
  }

  // 获取单词的发音
  async getPhonemes(word) {
    if (!word || typeof word !== 'string') {
      return null;
    }

    const normalizedWord = word.toLowerCase().trim();
    const firstLetter = normalizedWord[0];

    // 确保对应的块已加载
    await this.preloadChunk(firstLetter);
    
    const chunk = this.loadedChunks.get(firstLetter);
    if (!chunk || !chunk[normalizedWord]) {
      return null;
    }

    const pronunciations = chunk[normalizedWord];
    
    // 返回第一个发音（主要发音）
    if (pronunciations && pronunciations.length > 0) {
      return {
        word: normalizedWord,
        arpa: pronunciations[0].arpa,
        ipa: pronunciations[0].ipa,
        variants: pronunciations.length > 1 ? pronunciations.slice(1) : []
      };
    }

    return null;
  }

  // 检查词典中是否包含某个单词
  async hasWord(word) {
    const result = await this.getPhonemes(word);
    return result !== null;
  }

  // 批量获取多个单词的发音
  async batchGetPhonemes(words) {
    if (!Array.isArray(words)) {
      return [];
    }

    // 按首字母分组以优化加载
    const wordsByLetter = new Map();
    for (const word of words) {
      if (word && typeof word === 'string') {
        const firstLetter = word.toLowerCase()[0];
        if (!wordsByLetter.has(firstLetter)) {
          wordsByLetter.set(firstLetter, []);
        }
        wordsByLetter.get(firstLetter).push(word);
      }
    }

    // 预加载所需的块
    const loadPromises = Array.from(wordsByLetter.keys()).map(letter => 
      this.preloadChunk(letter)
    );
    await Promise.all(loadPromises);

    // 批量查询
    const results = [];
    for (const word of words) {
      const result = await this.getPhonemes(word);
      results.push({
        word,
        found: result !== null,
        phonemes: result
      });
    }

    return results;
  }

  // 获取指定字母开头的所有单词（用于调试和统计）
  async getWordsByLetter(letter) {
    const normalizedLetter = letter.toLowerCase();
    await this.preloadChunk(normalizedLetter);
    
    const chunk = this.loadedChunks.get(normalizedLetter);
    if (!chunk) {
      return [];
    }

    return Object.keys(chunk).sort();
  }

  // 清理已加载的块以释放内存
  clearCache() {
    this.loadedChunks.clear();
  }

  // 清理指定字母的块
  clearChunk(letter) {
    const normalizedLetter = letter.toLowerCase();
    this.loadedChunks.delete(normalizedLetter);
  }

  // 获取内存使用情况
  getMemoryUsage() {
    const loadedChunks = Array.from(this.loadedChunks.keys());
    const totalWords = loadedChunks.reduce((sum, letter) => {
      const chunk = this.loadedChunks.get(letter);
      return sum + (chunk ? Object.keys(chunk).length : 0);
    }, 0);

    return {
      loadedChunks: loadedChunks,
      totalLoadedWords: totalWords,
      memoryEstimate: `${Math.round(totalWords * 0.1)}KB` // 粗略估计
    };
  }
}

// 创建单例实例
const cmuDictService = new CMUDictService();

// 导出便捷函数
export const getPhonemes = (word) => cmuDictService.getPhonemes(word);
export const hasWord = (word) => cmuDictService.hasWord(word);
export const batchGetPhonemes = (words) => cmuDictService.batchGetPhonemes(words);
export const getStats = () => cmuDictService.getStats();
export const preloadChunk = (letter) => cmuDictService.preloadChunk(letter);
export const clearCache = () => cmuDictService.clearCache();
export const getMemoryUsage = () => cmuDictService.getMemoryUsage();

// 导出服务实例
export { cmuDictService };
export default cmuDictService;