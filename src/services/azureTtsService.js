// Azure AI Text-to-Speech Service
import { escapeXml } from '../utils/xmlUtils'
import { getAllowedVoiceIds, getVoiceId, isValidVoiceCombination } from '../config/voiceConfig'

class AzureTTSService {
  constructor() {
    // 使用本地Netlify Functions端点，不再需要前端暴露API密钥
    this.apiEndpoint = '/.netlify/functions/tts';
    
    // 开发环境下可能需要不同的端点
    if (import.meta.env.DEV && import.meta.env.VITE_TTS_ENDPOINT) {
      this.apiEndpoint = import.meta.env.VITE_TTS_ENDPOINT;
    }
    
    // Voice mapping for different accents and genders
    this.voiceMap = {
      'us-male': 'en-US-GuyNeural',
      'us-female': 'en-US-JennyNeural', 
      'gb-male': 'en-GB-RyanNeural',
      'gb-female': 'en-GB-SoniaNeural'
    };
    
    // 当前播放的音频引用
    this.currentAudio = null;
    
    // 音频缓存 - 避免重复调用API
    this.audioCache = new Map();
    
    // 缓存大小限制（防止内存过度使用）
    this.maxCacheSize = 50;
  }

  // 生成缓存键（不包含语速，语速通过playbackRate控制）
  generateCacheKey(text, accent, gender) {
    return `${text}-${accent}-${gender}`;
  }

  // 管理缓存大小
  manageCacheSize() {
    if (this.audioCache.size >= this.maxCacheSize) {
      // 删除最旧的缓存项（FIFO策略）
      const firstKey = this.audioCache.keys().next().value;
      const cachedItem = this.audioCache.get(firstKey);
      if (cachedItem && cachedItem.url) {
        URL.revokeObjectURL(cachedItem.url);
      }
      this.audioCache.delete(firstKey);
    }
  }

  async synthesizeSpeech(text, accent = 'us', gender = 'male', speed = 1.0) {
    // 验证声音组合是否在白名单中
    if (!isValidVoiceCombination(accent, gender)) {
      throw new Error(`Invalid voice combination: ${accent}-${gender}. Only whitelisted voices are allowed.`);
    }

    // 检查缓存
    const cacheKey = this.generateCacheKey(text, accent, gender);
    if (this.audioCache.has(cacheKey)) {
      console.log('使用缓存的音频:', cacheKey);
      return this.audioCache.get(cacheKey).blob;
    }

    // 使用配置文件中的声音ID
    const voiceName = getVoiceId(accent, gender);
    
    if (!voiceName) {
      throw new Error(`Unsupported voice combination: ${accent}-${gender}`);
    }

    // 计算语速百分比
    const ratePercent = Math.round((speed - 1) * 100);
    const rateString = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;

    try {
      console.log('调用本地TTS API:', cacheKey);
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          voice: voiceName,
          rate: rateString,
          pitch: '0%'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`TTS API error: ${response.status} - ${errorData.error}`);
      }

      const data = await response.json();
      
      // 将base64音频转换为Blob
      const binaryString = atob(data.audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBlob = new Blob([bytes], { type: data.contentType || 'audio/mpeg' });
      
      // 缓存音频
      this.manageCacheSize();
      const audioUrl = URL.createObjectURL(audioBlob);
      this.audioCache.set(cacheKey, {
        blob: audioBlob,
        url: audioUrl,
        timestamp: Date.now()
      });
      
      return audioBlob;
    } catch (error) {
      console.error('TTS API Error:', error);
      throw error;
    }
  }

  async playAudio(text, accent = 'us', gender = 'male', speed = 1.0) {
    try {
      // 停止当前播放的音频
      this.stop();
      
      const audioBlob = await this.synthesizeSpeech(text, accent, gender, speed);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      // 设置播放速度
      audio.playbackRate = speed;
      this.currentAudio = audio;
      
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          resolve();
        };
        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          reject(error);
        };
        audio.play().catch(reject);
      });
    } catch (error) {
      console.error('Azure TTS playback error:', error);
      throw error;
    }
  }

  // Helper method to escape XML characters in text (now using imported function)
  // escapeXml method removed - using imported escapeXml function instead

  // Get available voices for a specific accent
  getAvailableVoices(accent) {
    const voices = [];
    Object.keys(this.voiceMap).forEach(key => {
      if (key.startsWith(accent)) {
        const gender = key.split('-')[1];
        voices.push({
          key,
          accent,
          gender,
          name: this.voiceMap[key]
        });
      }
    });
    return voices;
  }

  // 停止当前播放
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }
  
  // 检查是否正在播放
  isPlaying() {
    return !!(this.currentAudio && !this.currentAudio.paused);
  }
  
  // 清除所有缓存
  clearCache() {
    console.log('清除Azure TTS缓存，共', this.audioCache.size, '项');
    this.audioCache.forEach((cachedItem) => {
      if (cachedItem.url) {
        URL.revokeObjectURL(cachedItem.url);
      }
    });
    this.audioCache.clear();
  }
  
  // 获取缓存统计信息
  getCacheStats() {
    return {
      size: this.audioCache.size,
      maxSize: this.maxCacheSize,
      keys: Array.from(this.audioCache.keys())
    };
  }
  
  // 开发者工具：在控制台显示缓存状态
  logCacheStats() {
    const stats = this.getCacheStats();
    console.group('🎵 Azure TTS 缓存状态');
    console.log('缓存大小:', stats.size + '/' + stats.maxSize);
    console.log('缓存项:', stats.keys);
    console.groupEnd();
    return stats;
  }
  
  // Check if TTS service is available
  isAvailable() {
    // 本地API总是可用的（假设Netlify Functions正常运行）
    return true;
  }
}

const azureTtsServiceInstance = new AzureTTSService();

// 开发环境下暴露到全局，方便调试
if (import.meta.env.DEV) {
  window.azureTtsService = azureTtsServiceInstance;
  window.checkTTSCache = () => azureTtsServiceInstance.logCacheStats();
}

export default azureTtsServiceInstance;