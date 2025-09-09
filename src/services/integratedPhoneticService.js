/**
 * 集成音标服务 - 基于phonetics_module的完整音标系统
 * 提供准确的IPA音标显示，支持美式和英式发音
 */

import PhoneticsCore, { createPhoneticsCore } from './phoneticsCoreService.js';
import PhoneticsUI, { createPhoneticsUI } from './phoneticsUIService.js';
import { defaultDict, PHONETICS_VERSION } from './phoneticsDataService.js';

class IntegratedPhoneticService {
    constructor(options = {}) {
        this.options = {
            accent: 'us', // 默认美式发音
            showPhonetic: false,
            enableClickToSpeak: true,
            enableHover: true,
            ...options
        };
        
        this.core = null;
        this.ui = null;
        this.initialized = false;
        this.initPromise = null;
    }
    
    /**
     * 初始化服务
     */
    async initialize() {
        if (this.initialized) {
            return this;
        }
        
        if (this.initPromise) {
            return this.initPromise;
        }
        
        this.initPromise = this._doInitialize();
        return this.initPromise;
    }
    
    /**
     * 执行初始化
     */
    async _doInitialize() {
        try {
            console.log('[IntegratedPhoneticService] 开始初始化音标服务...');
            
            // 创建核心服务
            this.core = createPhoneticsCore({
                version: PHONETICS_VERSION,
                storageKey: 'phoneticsDict_v2',
                versionKey: 'phoneticsDict_version_v2'
            });
            
            // 设置口音
            this.core.setAccent(this.options.accent);
            
            // 尝试加载完整字典
            await this.core.ensureFullDictionary();
            
            // 创建UI服务
            this.ui = new PhoneticsUI(this.core, {
                showPhonetic: this.options.showPhonetic,
                enableClickToSpeak: this.options.enableClickToSpeak,
                enableHover: this.options.enableHover
            });
            
            this.initialized = true;
            console.log('[IntegratedPhoneticService] 音标服务初始化完成');
            
            // 输出字典统计信息
            const stats = this.core.getDictStats();
            console.log('[IntegratedPhoneticService] 字典统计:', stats);
            
            return this;
        } catch (error) {
            console.error('[IntegratedPhoneticService] 初始化失败:', error);
            throw error;
        }
    }
    
    /**
     * 获取单词的音标
     * @param {string} word - 单词
     * @param {Object} options - 配置选项 {accent, format}
     * @returns {Object} 包含success、phonemes、source等字段的结果对象
     */
    async getPhonemes(word, options = {}) {
        await this.initialize();
        
        if (!word || typeof word !== 'string') {
            return {
                success: false,
                error: 'Invalid word input',
                source: 'validation'
            };
        }
        
        try {
             const targetAccent = options.accent || this.options.accent;
             // 设置口音
             this.core.setAccent(targetAccent);
             const phonetic = this.core.getPhonetic(word);
            
            if (phonetic) {
                return {
                    success: true,
                    phonemes: this._formatIPA(phonetic),
                    source: 'integrated-core'
                };
            } else {
                return {
                    success: false,
                    error: 'Phonetic not found',
                    source: 'integrated-core'
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                source: 'error'
            };
        }
    }
    
    /**
     * 批量获取音标
     * @param {string[]} words - 单词数组
     * @param {Object} options - 配置选项 {accent, format}
     * @returns {Array} 结果对象数组
     */
    async getBatchPhonemes(words, options = {}) {
        await this.initialize();
        
        const results = [];
        
        for (const word of words) {
            const result = await this.getPhonemes(word, options);
            results.push({
                word,
                ...result
            });
        }
        
        return results;
    }
    
    /**
     * 设置口音
     * @param {string} accent - 'us' 或 'uk'
     */
    setAccent(accent) {
        if (accent === 'us' || accent === 'uk') {
            this.options.accent = accent;
            if (this.core) {
                this.core.setAccent(accent);
            }
        }
    }
    
    /**
     * 获取当前口音
     * @returns {string} 当前口音
     */
    getAccent() {
        return this.options.accent;
    }
    
    /**
     * 获取服务统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        if (this.core && this.core.getDictStats) {
            return this.core.getDictStats();
        }
        return {
            queries: 0,
            cacheHits: 0,
            cacheHitRate: '0%',
            workerQueries: 0,
            fallbackQueries: 0,
            errors: 0
        };
    }
    
    /**
     * 渲染文本到容器
     * @param {string} containerId - 容器ID
     * @param {string} text - 文本
     */
    async renderToContainer(containerId, text) {
        await this.initialize();
        
        if (this.ui) {
            this.ui.containerId = containerId;
            this.ui.setText(text);
            this.ui.render();
        }
    }
    
    /**
     * 显示音标
     */
    async showPhonetics() {
        await this.initialize();
        
        if (this.ui) {
            this.ui.showPhonetics();
        }
    }
    
    /**
     * 隐藏音标
     */
    async hidePhonetics() {
        await this.initialize();
        
        if (this.ui) {
            this.ui.hidePhonetics();
        }
    }
    
    /**
     * 切换音标显示
     */
    async togglePhonetics() {
        await this.initialize();
        
        if (this.ui) {
            this.ui.togglePhonetics();
        }
    }
    
    /**
     * 获取字典统计信息
     * @returns {Object} 统计信息
     */
    async getStats() {
        await this.initialize();
        
        if (this.core) {
            return this.core.getDictStats();
        }
        
        return { total: 0, us: 0, uk: 0 };
    }
    
    /**
     * 格式化IPA音标
     * @param {string} phonetic - 原始音标
     * @returns {string} 格式化后的音标
     */
    _formatIPA(phonetic) {
        if (!phonetic || typeof phonetic !== 'string') {
            return '';
        }
        
        const trimmed = phonetic.trim();
        if (!trimmed) {
            return '';
        }
        
        // 确保音标有双斜杠
        if (trimmed.startsWith('/') && trimmed.endsWith('/')) {
            return trimmed;
        }
        
        return `/${trimmed}/`;
    }
    
    /**
     * 检查是否已初始化
     * @returns {boolean} 是否已初始化
     */
    isInitialized() {
        return this.initialized;
    }
    
    /**
     * 销毁服务
     */
    destroy() {
        this.core = null;
        this.ui = null;
        this.initialized = false;
        this.initPromise = null;
    }
}

// 创建单例实例
let instance = null;

/**
 * 获取集成音标服务实例
 * @param {Object} options - 配置选项
 * @returns {IntegratedPhoneticService} 服务实例
 */
export function getIntegratedPhoneticService(options = {}) {
    if (!instance) {
        instance = new IntegratedPhoneticService(options);
    }
    return instance;
}

/**
 * 创建新的音标服务实例
 * @param {Object} options - 配置选项
 * @returns {IntegratedPhoneticService} 新的服务实例
 */
export function createIntegratedPhoneticService(options = {}) {
    return new IntegratedPhoneticService(options);
}

export default IntegratedPhoneticService;