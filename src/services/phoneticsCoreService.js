/**
 * 音标模块核心功能
 * 提供音标字典管理、音标获取等核心功能
 */

import { defaultDict } from './phoneticsDataService.js';
import { loadChunk, AVAILABLE_CHUNKS, CMU_STATS } from '../data/cmu/index.js';

class PhoneticsCore {
    constructor(options = {}) {
        this.options = {
            storageKey: 'phoneticsDict',
            versionKey: 'phoneticsDict_version',
            version: 3,
            skipPersistKey: 'phonetics_skip_persist',
            inmemFlagKey: 'phonetics_inmem_loaded',
            ...options
        };
        
        this.defaultDict = defaultDict;
        
        this.dict = this.loadDict();
        this.accent = 'us'; // 默认美式发音
    }
    
    /**
     * 加载字典
     */
    loadDict() {
        try {
            // 检查是否在浏览器环境中
            if (typeof localStorage !== 'undefined') {
                const raw = localStorage.getItem(this.options.storageKey);
                if (!raw) {
                    localStorage.setItem(this.options.storageKey, JSON.stringify(this.defaultDict));
                    return { ...this.defaultDict };
                }
                return { ...this.defaultDict, ...JSON.parse(raw) };
            } else {
                // Node.js环境，直接返回默认字典
                console.log('Running in Node.js environment, using default dictionary');
                return { ...this.defaultDict };
            }
        } catch (e) {
            console.error('Error loading dictionary:', e);
            return { ...this.defaultDict };
        }
    }
    
    /**
     * 保存字典
     */
    saveDict(dict) {
        try {
            // 检查是否在浏览器环境中
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(this.options.storageKey, JSON.stringify(dict));
                console.log('Dictionary saved successfully');
            } else {
                // Node.js环境，跳过保存
                console.log('Running in Node.js environment, skipping dictionary save');
            }
        } catch (e) {
            try { 
                if (typeof sessionStorage !== 'undefined') {
                    sessionStorage.setItem(this.options.skipPersistKey, '1'); 
                }
            } catch {}
            console.warn('Save dictionary skipped (quota or blocked):', e);
        }
    }
    
    /**
     * 包装IPA格式
     */
    wrapIPA(s) {
        if (!s || typeof s !== 'string') return '';
        const trimmed = s.trim();
        if (!trimmed) return '';
        return trimmed.startsWith('/') && trimmed.endsWith('/') ? trimmed : `/${trimmed}/`;
    }
    
    /**
     * 构建统一字典
     */
    buildUnifiedDict(usRaw, ukRaw) {
        // 标准化源字典为小写键
        const normalize = (raw) => {
            const out = {};
            if (!raw) return out;
            for (const k of Object.keys(raw)) {
                const nk = String(k || '').toLowerCase();
                if (!(nk in out)) out[nk] = raw[k];
            }
            return out;
        };
        
        const usN = normalize(usRaw);
        const ukN = normalize(ukRaw);
        
        const unified = {};
        const keys = new Set([...Object.keys(usN), ...Object.keys(ukN)]);
        
        for (const key of keys) {
            const usIpa = usN[key];
            const ukIpa = ukN[key];
            const us = usIpa ? this.wrapIPA(usIpa) : undefined;
            const uk = ukIpa ? this.wrapIPA(ukIpa) : undefined;
            if (us || uk) {
                unified[key] = { 
                    ...(us && { us }), 
                    ...(uk && { uk }) 
                };
            }
        }
        
        // 将默认字典放在前面，这样完整字典会覆盖它们
        return { ...this.defaultDict, ...unified };
    }
    
    /**
     * 检查字典是否需要升级
     */
    dictNeedsUpgrade() {
        try {
            const v = Number(localStorage.getItem(this.options.versionKey) || '0');
            if (v < this.options.version) return true;
            
            const raw = localStorage.getItem(this.options.storageKey);
            if (!raw) return true;
            
            const obj = JSON.parse(raw);
            // 启发式：完整字典应该有数千个条目
            const size = Object.keys(obj || {}).length;
            return size < 1000;
        } catch {
            return true;
        }
    }
    
    /**
     * 尝试获取JSON文件
     */
    async tryFetchJSON(possiblePaths) {
        for (const p of possiblePaths) {
            try {
                const res = await fetch(p);
                if (!res.ok) continue;
                const json = await res.json();
                console.log('[Dict] Loaded', p, 'entries:', Object.keys(json).length);
                return json;
            } catch (e) {
                // 尝试下一个路径
            }
        }
        return null;
    }
    
    /**
     * 确保完整字典已加载
     */
    async ensureFullDictionary() {
        try {
            if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(this.options.inmemFlagKey) === '1') return; // 本会话已加载
        } catch {}
        
        if (!this.dictNeedsUpgrade()) return; // 已经加载
        
        console.log('[Dict] Loading CMU dictionary...');
        
        try {
            // 加载CMU字典的所有块
            const allChunks = {};
            let totalEntries = 0;
            
            for (const letter of AVAILABLE_CHUNKS) {
                try {
                    const chunk = await loadChunk(letter);
                    if (chunk && typeof chunk === 'object') {
                        Object.assign(allChunks, chunk);
                        totalEntries += Object.keys(chunk).length;
                        console.log(`[Dict] Loaded chunk ${letter}: ${Object.keys(chunk).length} entries`);
                    }
                } catch (error) {
                    console.warn(`[Dict] Failed to load chunk ${letter}:`, error);
                }
            }
            
            if (totalEntries === 0) {
                console.warn('[Dict] Failed to load CMU dictionary, keep default minimal dict.');
                return null;
            }
            
            console.log(`[Dict] Successfully loaded CMU dictionary: ${totalEntries} entries`);
            
            // 合并默认字典和CMU字典
            const unified = { ...this.defaultDict, ...allChunks };
            
            // 更新当前字典
            this.dict = unified;
            
            // 尝试持久化
            this.saveDict(unified);
            
            try { 
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem(this.options.versionKey, String(this.options.version)); 
                }
            } catch {}
            
            try { 
                if (typeof sessionStorage !== 'undefined') {
                    sessionStorage.setItem(this.options.inmemFlagKey, '1'); 
                }
            } catch {}
            
            return unified;
        } catch (error) {
            console.error('[Dict] Error loading CMU dictionary:', error);
            return null;
        }
    }
    
    /**
     * 分词函数
     */
    tokenize(sentence) {
        return sentence.split(/\s+/).filter(Boolean);
    }
    
    /**
     * 获取单词的音标
     */
    getPhonetic(word) {
        const key = word.toLowerCase().replace(/[^a-z']/g, '');
        const entry = this.dict[key];
        if (!entry) return '';
        
        let phonetic = '';
        
        // 处理CMU字典格式（数组形式）
        if (Array.isArray(entry)) {
            // 取第一个发音变体的IPA音标
            phonetic = entry[0]?.ipa || '';
        } else {
            // 处理旧格式（对象形式）
            phonetic = entry[this.accent] || entry[this.accent === 'us' ? 'uk' : 'us'] || '';
        }
        
        // 确保使用标准IPA格式（双斜杠）
        return this.wrapIPA(phonetic);
    }
    
    /**
     * 设置口音
     */
    setAccent(accent) {
        if (accent === 'us' || accent === 'uk') {
            this.accent = accent;
        }
    }
    
    /**
     * 获取当前口音
     */
    getAccent() {
        return this.accent;
    }
    
    /**
     * 更新字典
     */
    updateDict(newDict) {
        this.dict = { ...this.dict, ...newDict };
        this.saveDict(this.dict);
    }
    
    /**
     * 获取字典统计信息
     */
    getDictStats() {
        const totalEntries = Object.keys(this.dict).length;
        let usEntries = 0;
        let ukEntries = 0;
        
        for (const entry of Object.values(this.dict)) {
            if (entry.us) usEntries++;
            if (entry.uk) ukEntries++;
        }
        
        return {
            total: totalEntries,
            us: usEntries,
            uk: ukEntries
        };
    }
}

// ES6 模块导出
export default PhoneticsCore;

// 工厂函数
export function createPhoneticsCore(options) {
    return new PhoneticsCore(options);
}