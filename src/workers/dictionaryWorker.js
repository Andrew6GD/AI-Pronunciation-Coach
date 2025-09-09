/**
 * 词典查询Web Worker
 * 在后台线程处理音标查询，避免阻塞UI
 */

// 导入词典相关模块
import { getCMUPhonemes, hasCMUEntry } from '../data/cmuHighFrequency.js';
import { convertArpaToIPA } from '../data/arpaToIpaMapper.js';
import { getBritishException, applyBritishRules } from '../data/britishExceptions.js';

/**
 * Worker内部缓存
 */
const workerCache = new Map();
const cacheTimestamps = new Map();
const CACHE_TIMEOUT = 30 * 60 * 1000; // 30分钟
const MAX_CACHE_SIZE = 10000;

/**
 * 统计信息
 */
const stats = {
  totalQueries: 0,
  cacheHits: 0,
  processingTime: 0,
  errors: 0
};

/**
 * 消息处理器
 */
self.onmessage = async function(event) {
  const { id, type, data } = event.data;
  
  try {
    let result;
    
    switch (type) {
      case 'GET_PHONETICS':
        result = await handleGetPhonetics(data);
        break;
        
      case 'BATCH_PHONETICS':
        result = await handleBatchPhonetics(data);
        break;
        
      case 'PRELOAD_WORDS':
        result = await handlePreloadWords(data);
        break;
        
      case 'CLEAR_CACHE':
        result = handleClearCache(data);
        break;
        
      case 'GET_STATS':
        result = getWorkerStats();
        break;
        
      case 'PING':
        result = { status: 'alive', timestamp: Date.now() };
        break;
        
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
    
    // 发送成功响应
    self.postMessage({
      id,
      success: true,
      result
    });
    
  } catch (error) {
    stats.errors++;
    
    // 发送错误响应
    self.postMessage({
      id,
      success: false,
      error: {
        message: error.message,
        stack: error.stack
      }
    });
  }
};

/**
 * 处理单个音标查询
 * @param {object} data - 查询数据
 * @returns {Promise<object>} - 查询结果
 */
async function handleGetPhonetics(data) {
  const startTime = performance.now();
  stats.totalQueries++;
  
  const {
    word,
    accent = 'american',
    useCache = true,
    fallbackToEspeak = false // Worker中不使用eSpeak回退
  } = data;
  
  const normalizedWord = word.toLowerCase().trim();
  const cacheKey = `${normalizedWord}_${accent}`;
  
  // 检查缓存
  if (useCache) {
    const cachedResult = getCachedResult(cacheKey);
    if (cachedResult) {
      stats.cacheHits++;
      stats.processingTime += performance.now() - startTime;
      return cachedResult;
    }
  }
  
  // 获取音标
  const result = await getPhoneticResult(normalizedWord, accent, fallbackToEspeak);
  
  // 缓存结果
  if (useCache && result.success) {
    setCachedResult(cacheKey, result);
  }
  
  stats.processingTime += performance.now() - startTime;
  return result;
}

/**
 * 处理批量音标查询
 * @param {object} data - 批量查询数据
 * @returns {Promise<object[]>} - 查询结果列表
 */
async function handleBatchPhonetics(data) {
  const { words, options = {}, batchSize = 100 } = data;
  const results = [];
  
  // 分批处理以避免阻塞
  for (let i = 0; i < words.length; i += batchSize) {
    const batch = words.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(word => handleGetPhonetics({ word, ...options }))
    );
    results.push(...batchResults);
    
    // 发送进度更新
    if (i + batchSize < words.length) {
      self.postMessage({
        type: 'PROGRESS',
        progress: {
          completed: i + batchSize,
          total: words.length,
          percentage: Math.round((i + batchSize) / words.length * 100)
        }
      });
      
      // 让出控制权
      await new Promise(resolve => setTimeout(resolve, 1));
    }
  }
  
  return results;
}

/**
 * 处理单词预加载
 * @param {object} data - 预加载数据
 * @returns {Promise<object>} - 预加载结果
 */
async function handlePreloadWords(data) {
  const { words, options = {} } = data;
  const results = await handleBatchPhonetics({ words, options });
  
  return {
    preloaded: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    total: results.length
  };
}

/**
 * 处理缓存清理
 * @param {object} data - 清理选项
 * @returns {object} - 清理结果
 */
function handleClearCache(data) {
  const { force = false } = data || {};
  const beforeSize = workerCache.size;
  
  if (force) {
    workerCache.clear();
    cacheTimestamps.clear();
  } else {
    // 只清理过期缓存
    const now = Date.now();
    for (const [key, timestamp] of cacheTimestamps.entries()) {
      if (now - timestamp > CACHE_TIMEOUT) {
        workerCache.delete(key);
        cacheTimestamps.delete(key);
      }
    }
  }
  
  return {
    cleared: beforeSize - workerCache.size,
    remaining: workerCache.size
  };
}

/**
 * 获取音标结果
 * @param {string} word - 单词
 * @param {string} accent - 口音
 * @param {boolean} fallbackToEspeak - 是否回退到eSpeak
 * @returns {Promise<object>} - 音标结果
 */
async function getPhoneticResult(word, accent, fallbackToEspeak) {
  try {
    // 1. 检查英式发音例外
    if (accent === 'british') {
      const britishException = getBritishException(word);
      if (britishException) {
        return {
          success: true,
          word,
          ipa: britishException,
          source: 'british_exceptions',
          accent,
          timestamp: Date.now()
        };
      }
    }
    
    // 2. 查询CMU词典
    if (hasCMUEntry(word)) {
      const arpaPhonemes = getCMUPhonemes(word);
      if (arpaPhonemes) {
        let ipa = convertArpaToIPA(arpaPhonemes, accent);
        
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
          accent,
          timestamp: Date.now()
        };
      }
    }
    
    // 3. 无法在Worker中获取音标
    return {
      success: false,
      word,
      error: 'No phonetic data available in worker context',
      accent,
      timestamp: Date.now(),
      needsFallback: true // 标记需要主线程回退处理
    };
    
  } catch (error) {
    return {
      success: false,
      word,
      error: error.message,
      accent,
      timestamp: Date.now()
    };
  }
}

/**
 * 获取缓存结果
 * @param {string} key - 缓存键
 * @returns {object|null} - 缓存结果
 */
function getCachedResult(key) {
  if (!workerCache.has(key)) {
    return null;
  }
  
  const timestamp = cacheTimestamps.get(key);
  if (Date.now() - timestamp > CACHE_TIMEOUT) {
    // 缓存过期
    workerCache.delete(key);
    cacheTimestamps.delete(key);
    return null;
  }
  
  return workerCache.get(key);
}

/**
 * 设置缓存结果
 * @param {string} key - 缓存键
 * @param {object} result - 结果
 */
function setCachedResult(key, result) {
  // 检查缓存大小限制
  if (workerCache.size >= MAX_CACHE_SIZE) {
    evictOldestCache();
  }
  
  workerCache.set(key, result);
  cacheTimestamps.set(key, Date.now());
}

/**
 * 清理最旧的缓存项
 */
function evictOldestCache() {
  let oldestKey = null;
  let oldestTime = Date.now();
  
  for (const [key, timestamp] of cacheTimestamps.entries()) {
    if (timestamp < oldestTime) {
      oldestTime = timestamp;
      oldestKey = key;
    }
  }
  
  if (oldestKey) {
    workerCache.delete(oldestKey);
    cacheTimestamps.delete(oldestKey);
  }
}

/**
 * 获取Worker统计信息
 * @returns {object} - 统计信息
 */
function getWorkerStats() {
  const cacheHitRate = stats.totalQueries > 0 
    ? (stats.cacheHits / stats.totalQueries * 100).toFixed(2)
    : '0.00';
  
  const avgProcessingTime = stats.totalQueries > 0
    ? (stats.processingTime / stats.totalQueries).toFixed(2)
    : '0.00';
  
  return {
    ...stats,
    cacheHitRate: `${cacheHitRate}%`,
    avgProcessingTime: `${avgProcessingTime}ms`,
    cacheSize: workerCache.size,
    memoryUsage: {
      cacheEntries: workerCache.size,
      timestampEntries: cacheTimestamps.size
    },
    uptime: Date.now() - (self.startTime || Date.now())
  };
}

// 记录Worker启动时间
self.startTime = Date.now();

// 发送Worker就绪信号
self.postMessage({
  type: 'WORKER_READY',
  timestamp: Date.now()
});