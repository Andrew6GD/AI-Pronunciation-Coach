/**
 * Web Worker管理器
 * 管理词典查询Worker的生命周期和通信
 */

/**
 * Worker管理器类
 */
class WorkerManager {
  constructor() {
    this.worker = null;
    this.isReady = false;
    this.messageId = 0;
    this.pendingMessages = new Map();
    this.stats = {
      messagesProcessed: 0,
      errors: 0,
      avgResponseTime: 0,
      totalResponseTime: 0
    };
    
    this.initWorker();
  }
  
  /**
   * 初始化Worker
   */
  async initWorker() {
    try {
      // 创建Worker
      this.worker = new Worker(
        new URL('../workers/dictionaryWorker.js', import.meta.url),
        { type: 'module' }
      );
      
      // 设置消息处理器
      this.worker.onmessage = this.handleWorkerMessage.bind(this);
      this.worker.onerror = this.handleWorkerError.bind(this);
      
      // 等待Worker就绪
      await this.waitForWorkerReady();
      
      console.log('Dictionary worker initialized successfully');
    } catch (error) {
      console.error('Failed to initialize dictionary worker:', error);
      this.isReady = false;
    }
  }
  
  /**
   * 等待Worker就绪
   * @returns {Promise<void>}
   */
  waitForWorkerReady() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Worker initialization timeout'));
      }, 5000);
      
      const messageHandler = (event) => {
        if (event.data.type === 'WORKER_READY') {
          clearTimeout(timeout);
          this.worker.removeEventListener('message', messageHandler);
          this.isReady = true;
          resolve();
        }
      };
      
      this.worker.addEventListener('message', messageHandler);
    });
  }
  
  /**
   * 处理Worker消息
   * @param {MessageEvent} event - 消息事件
   */
  handleWorkerMessage(event) {
    const { id, type, success, result, error, progress } = event.data;
    
    // 处理进度更新
    if (type === 'PROGRESS') {
      this.onProgress?.(progress);
      return;
    }
    
    // 处理响应消息
    if (id && this.pendingMessages.has(id)) {
      const { resolve, reject, startTime } = this.pendingMessages.get(id);
      
      // 更新统计信息
      const responseTime = Date.now() - startTime;
      this.stats.messagesProcessed++;
      this.stats.totalResponseTime += responseTime;
      this.stats.avgResponseTime = this.stats.totalResponseTime / this.stats.messagesProcessed;
      
      this.pendingMessages.delete(id);
      
      if (success) {
        resolve(result);
      } else {
        this.stats.errors++;
        reject(new Error(error?.message || 'Worker error'));
      }
    }
  }
  
  /**
   * 处理Worker错误
   * @param {ErrorEvent} event - 错误事件
   */
  handleWorkerError(event) {
    console.error('Dictionary worker error:', event.error);
    this.stats.errors++;
    
    // 尝试重新初始化Worker
    this.restartWorker();
  }
  
  /**
   * 重启Worker
   */
  async restartWorker() {
    console.log('Restarting dictionary worker...');
    
    // 清理现有Worker
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    
    this.isReady = false;
    
    // 拒绝所有待处理的消息
    for (const [id, { reject }] of this.pendingMessages.entries()) {
      reject(new Error('Worker restarted'));
    }
    this.pendingMessages.clear();
    
    // 重新初始化
    await this.initWorker();
  }
  
  /**
   * 发送消息到Worker
   * @param {string} type - 消息类型
   * @param {object} data - 消息数据
   * @param {number} timeout - 超时时间（毫秒）
   * @returns {Promise<any>} - 响应结果
   */
  sendMessage(type, data = {}, timeout = 10000) {
    return new Promise((resolve, reject) => {
      if (!this.isReady) {
        reject(new Error('Worker not ready'));
        return;
      }
      
      const id = ++this.messageId;
      const startTime = Date.now();
      
      // 设置超时
      const timeoutId = setTimeout(() => {
        if (this.pendingMessages.has(id)) {
          this.pendingMessages.delete(id);
          reject(new Error('Worker message timeout'));
        }
      }, timeout);
      
      // 存储待处理消息
      this.pendingMessages.set(id, {
        resolve: (result) => {
          clearTimeout(timeoutId);
          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timeoutId);
          reject(error);
        },
        startTime
      });
      
      // 发送消息
      this.worker.postMessage({ id, type, data });
    });
  }
  
  /**
   * 获取单词音标
   * @param {string} word - 单词
   * @param {object} options - 选项
   * @returns {Promise<object>} - 音标结果
   */
  async getPhonetics(word, options = {}) {
    try {
      const result = await this.sendMessage('GET_PHONETICS', {
        word,
        ...options
      });
      
      // 如果Worker无法处理，回退到主线程
      if (!result.success && result.needsFallback) {
        return this.fallbackToMainThread(word, options);
      }
      
      return result;
    } catch (error) {
      console.warn('Worker phonetics query failed, falling back to main thread:', error);
      return this.fallbackToMainThread(word, options);
    }
  }
  
  /**
   * 批量获取音标
   * @param {string[]} words - 单词列表
   * @param {object} options - 选项
   * @param {function} onProgress - 进度回调
   * @returns {Promise<object[]>} - 音标结果列表
   */
  async getBatchPhonetics(words, options = {}, onProgress = null) {
    this.onProgress = onProgress;
    
    try {
      const results = await this.sendMessage('BATCH_PHONETICS', {
        words,
        options,
        batchSize: options.batchSize || 100
      }, 60000); // 60秒超时
      
      return results;
    } catch (error) {
      console.warn('Worker batch phonetics failed:', error);
      throw error;
    } finally {
      this.onProgress = null;
    }
  }
  
  /**
   * 预加载单词
   * @param {string[]} words - 单词列表
   * @param {object} options - 选项
   * @returns {Promise<object>} - 预加载结果
   */
  async preloadWords(words, options = {}) {
    return this.sendMessage('PRELOAD_WORDS', {
      words,
      options
    }, 120000); // 2分钟超时
  }
  
  /**
   * 清理Worker缓存
   * @param {boolean} force - 是否强制清理
   * @returns {Promise<object>} - 清理结果
   */
  async clearCache(force = false) {
    return this.sendMessage('CLEAR_CACHE', { force });
  }
  
  /**
   * 获取Worker统计信息
   * @returns {Promise<object>} - 统计信息
   */
  async getWorkerStats() {
    const workerStats = await this.sendMessage('GET_STATS');
    
    return {
      worker: workerStats,
      manager: {
        ...this.stats,
        isReady: this.isReady,
        pendingMessages: this.pendingMessages.size
      }
    };
  }
  
  /**
   * 主线程回退处理
   * @param {string} word - 单词
   * @param {object} options - 选项
   * @returns {Promise<object>} - 音标结果
   */
  async fallbackToMainThread(word, options) {
    try {
      // 动态导入以避免循环依赖
      const { eSpeakService } = await import('./eSpeakService.js');
      const ipa = await eSpeakService.textToIPA(word);
      
      return {
        success: true,
        word,
        ipa,
        source: 'espeak_fallback',
        accent: options.accent || 'american',
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        word,
        error: error.message,
        accent: options.accent || 'american',
        timestamp: Date.now()
      };
    }
  }
  
  /**
   * 检查Worker健康状态
   * @returns {Promise<boolean>} - 是否健康
   */
  async ping() {
    try {
      const result = await this.sendMessage('PING', {}, 5000);
      return result.status === 'alive';
    } catch (error) {
      return false;
    }
  }
  
  /**
   * 销毁Worker
   */
  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    
    this.isReady = false;
    
    // 拒绝所有待处理的消息
    for (const [id, { reject }] of this.pendingMessages.entries()) {
      reject(new Error('Worker destroyed'));
    }
    this.pendingMessages.clear();
  }
}

// 创建全局实例
export const workerManager = new WorkerManager();

// 导出类以供测试使用
export { WorkerManager };

// 便捷方法
export async function getWorkerPhonetics(word, options = {}) {
  return workerManager.getPhonetics(word, options);
}

export async function getBatchWorkerPhonetics(words, options = {}, onProgress = null) {
  return workerManager.getBatchPhonetics(words, options, onProgress);
}

export async function preloadWorkerWords(words, options = {}) {
  return workerManager.preloadWords(words, options);
}

export async function getWorkerManagerStats() {
  return workerManager.getWorkerStats();
}

export function destroyWorkerManager() {
  workerManager.destroy();
}