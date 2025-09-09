/**
 * 音标模块核心功能
 * 提供音标字典管理、音标获取等核心功能
 */

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
        
        this.defaultDict = {
            my: { us: "/maɪ/", uk: "/maɪ/" },
            family: { us: "/ˈfæməli/", uk: "/ˈfæmɪli/" },
            has: { us: "/hæz/", uk: "/hæz/" },
            four: { us: "/fɔːr/", uk: "/fɔː/" },
            people: { us: "/ˈpiːpəl/", uk: "/ˈpiːpl/" },
            we: { us: "/wiː/", uk: "/wiː/" },
            live: { us: "/lɪv/", uk: "/lɪv/" },
            in: { us: "/ɪn/", uk: "/ɪn/" },
            a: { us: "/ə/", uk: "/ə/" },
            big: { us: "/bɪɡ/", uk: "/bɪɡ/" },
            house: { us: "/haʊs/", uk: "/haʊs/" },
            with: { us: "/wɪð/", uk: "/wɪð/" },
            beautiful: { us: "/ˈbjuːtəfəl/", uk: "/ˈbjuːtɪfəl/" },
            garden: { us: "/ˈɡɑːrdən/", uk: "/ˈɡɑːdn/" }
        };
        
        this.dict = this.loadDict();
        this.accent = 'us'; // 默认美式发音
    }
    
    /**
     * 加载字典
     */
    loadDict() {
        try {
            const raw = localStorage.getItem(this.options.storageKey);
            if (!raw) {
                localStorage.setItem(this.options.storageKey, JSON.stringify(this.defaultDict));
                return { ...this.defaultDict };
            }
            return { ...this.defaultDict, ...JSON.parse(raw) };
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
            localStorage.setItem(this.options.storageKey, JSON.stringify(dict));
            console.log('Dictionary saved successfully');
        } catch (e) {
            try { 
                sessionStorage.setItem(this.options.skipPersistKey, '1'); 
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
            if (sessionStorage.getItem(this.options.inmemFlagKey) === '1') return; // 本会话已加载
        } catch {}
        
        if (!this.dictNeedsUpgrade()) return; // 已经加载
        
        // 尝试多个位置以保证健壮性
        const usPaths = [
            '/Old_code/AI Pronunciation Coach/public/data/en_US.json',
            '/Old_code/AI%20Pronunciation%20Coach/public/data/en_US.json',
            '../Old_code/AI Pronunciation Coach/public/data/en_US.json',
            '../Old_code/AI%20Pronunciation%20Coach/public/data/en_US.json',
            '../public/data/en_US.json',
            '../Old_code/AI Pronunciation Coach/src/data/en_US.json',
            '../Old_code/AI%20Pronunciation%20Coach/src/data/en_US.json',
            '/public/data/en_US.json',
            './data/en_US.json',
            'data/en_US.json'
        ];
        
        const ukPaths = [
            '/Old_code/AI Pronunciation Coach/public/data/en_UK.json',
            '/Old_code/AI%20Pronunciation%20Coach/public/data/en_UK.json',
            '../Old_code/AI Pronunciation Coach/public/data/en_UK.json',
            '../Old_code/AI%20Pronunciation%20Coach/public/data/en_UK.json',
            '../public/data/en_UK.json',
            '../Old_code/AI Pronunciation Coach/src/data/en_UK.json',
            '../Old_code/AI%20Pronunciation%20Coach/src/data/en_UK.json',
            '/public/data/en_UK.json',
            './data/en_UK.json',
            'data/en_UK.json'
        ];
        
        const [usRaw, ukRaw] = await Promise.all([
            this.tryFetchJSON(usPaths),
            this.tryFetchJSON(ukPaths)
        ]);
        
        if (!usRaw && !ukRaw) {
            console.warn('[Dict] Failed to load full dictionaries, keep default minimal dict.');
            return null;
        }
        
        const unified = this.buildUnifiedDict(usRaw || {}, ukRaw || {});
        
        // 尝试持久化；如果配额超出，我们仍然返回完整的内存字典，这样UI显示所有IPA
        this.saveDict(unified);
        
        try { 
            localStorage.setItem(this.options.versionKey, String(this.options.version)); 
        } catch {}
        
        try { 
            sessionStorage.setItem(this.options.inmemFlagKey, '1'); 
        } catch {}
        
        return unified;
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
        return entry[this.accent] || entry[this.accent === 'us' ? 'uk' : 'us'] || '';
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

// 导出类和工厂函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhoneticsCore;
} else if (typeof window !== 'undefined') {
    window.PhoneticsCore = PhoneticsCore;
}

// 工厂函数
function createPhoneticsCore(options) {
    return new PhoneticsCore(options);
}

if (typeof window !== 'undefined') {
    window.createPhoneticsCore = createPhoneticsCore;
}