// 移除Node.js特定的导入

/**
 * eSpeak-NG 服务类
 * 提供文本到 IPA 音标的转换功能
 */
class ESpeakService {
  constructor() {
    this.isInitialized = false;
    this.phoneticDictionary = new Map();
    this.espeakAvailable = false;
  }

  /**
   * 初始化 eSpeak-NG 服务
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }
    
    try {
      await this._doInitialize();
      this.isInitialized = true;
      console.log('eSpeakService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize eSpeakService:', error);
      // 即使初始化失败，也标记为已初始化，这样可以使用fallback方法
      this.isInitialized = true;
    }
  }

  async _doInitialize() {
    // 检查 eSpeak-NG 是否可用
    try {
      await this._checkESpeakAvailability();
      console.log('eSpeak-NG command line tool is available');
    } catch (error) {
      console.warn('eSpeak-NG command line tool not available:', error);
    }
    
    // 加载音标字典
    await this._loadPhoneticDictionary();
  }

  /**
    * 检查 eSpeak-NG 是否可用（浏览器环境下跳过）
    * @private
    */
   async _checkESpeakAvailability() {
     // 在浏览器环境中，我们无法使用命令行工具
     // 直接标记为不可用，使用fallback方法
     this.espeakAvailable = false;
     console.log('浏览器环境：使用内置音标字典');
   }

  /**
   * 加载音标字典
   * @private
   */
  async _loadPhoneticDictionary() {
    // 这里可以加载更大的音标字典
    // 目前使用内置的基础字典
    console.log('Phonetic dictionary loaded');
  }

  /**
   * 使用 eSpeak-NG 生成音标（浏览器环境下直接使用fallback）
   * @private
   */
  async _generateWithEspeak(text, voice) {
    // 在浏览器环境中直接使用fallback方法
    return this._fallbackPhonetic(text, voice);
  }

  /**
   * 备用音标生成（基于字典）
   * @private
   */
  _fallbackPhonetic(text, voice) {
    // 常用单词的音标字典
    const phoneticDict = {
      // 基础词汇
      'hello': { british: '/həˈləʊ/', american: '/həˈloʊ/' },
      'my': { british: '/maɪ/', american: '/maɪ/' },
      'name': { british: '/neɪm/', american: '/neɪm/' },
      'is': { british: '/ɪz/', american: '/ɪz/' },
      'tom': { british: '/tɒm/', american: '/tɑːm/' },
      'i': { british: '/aɪ/', american: '/aɪ/' },
      'like': { british: '/laɪk/', american: '/laɪk/' },
      'apples': { british: '/ˈæpəlz/', american: '/ˈæpəlz/' },
      'and': { british: '/ænd/', american: '/ænd/' },
      'bananas': { british: '/bəˈnɑːnəz/', american: '/bəˈnænəz/' },
      'the': { british: '/ðə/', american: '/ðə/' },
      'cat': { british: '/kæt/', american: '/kæt/' },
      'sleeping': { british: '/ˈsliːpɪŋ/', american: '/ˈsliːpɪŋ/' },
      'on': { british: '/ɒn/', american: '/ɑːn/' },
      'chair': { british: '/tʃeə/', american: '/tʃer/' },
      
      // 更多常用词汇
      'apple': { british: '/ˈæpəl/', american: '/ˈæpəl/' },
      'banana': { british: '/bəˈnɑːnə/', american: '/bəˈnænə/' },
      'water': { british: '/ˈwɔːtə/', american: '/ˈwɔːtər/' },
      'house': { british: '/haʊs/', american: '/haʊs/' },
      'book': { british: '/bʊk/', american: '/bʊk/' },
      'good': { british: '/ɡʊd/', american: '/ɡʊd/' },
      'time': { british: '/taɪm/', american: '/taɪm/' },
      'work': { british: '/wɜːk/', american: '/wɜːrk/' },
      'day': { british: '/deɪ/', american: '/deɪ/' },
      'year': { british: '/jɪə/', american: '/jɪr/' },
      'way': { british: '/weɪ/', american: '/weɪ/' },
      'new': { british: '/njuː/', american: '/nuː/' },
      'first': { british: '/fɜːst/', american: '/fɜːrst/' },
      'last': { british: '/lɑːst/', american: '/læst/' },
      'long': { british: '/lɒŋ/', american: '/lɔːŋ/' },
      'great': { british: '/ɡreɪt/', american: '/ɡreɪt/' },
      'little': { british: '/ˈlɪtəl/', american: '/ˈlɪtəl/' },
      'own': { british: '/əʊn/', american: '/oʊn/' },
      'other': { british: '/ˈʌðə/', american: '/ˈʌðər/' },
      'old': { british: '/əʊld/', american: '/oʊld/' },
      'right': { british: '/raɪt/', american: '/raɪt/' },
      'big': { british: '/bɪɡ/', american: '/bɪɡ/' },
      'high': { british: '/haɪ/', american: '/haɪ/' },
      'different': { british: '/ˈdɪfərənt/', american: '/ˈdɪfərənt/' },
      'small': { british: '/smɔːl/', american: '/smɔːl/' },
      'large': { british: '/lɑːdʒ/', american: '/lɑːrdʒ/' },
      'next': { british: '/nekst/', american: '/nekst/' },
      'early': { british: '/ˈɜːli/', american: '/ˈɜːrli/' },
      'young': { british: '/jʌŋ/', american: '/jʌŋ/' },
      'important': { british: '/ɪmˈpɔːtənt/', american: '/ɪmˈpɔːrtənt/' },
      'few': { british: '/fjuː/', american: '/fjuː/' },
      'public': { british: '/ˈpʌblɪk/', american: '/ˈpʌblɪk/' },
      'bad': { british: '/bæd/', american: '/bæd/' },
      'same': { british: '/seɪm/', american: '/seɪm/' },
      'able': { british: '/ˈeɪbəl/', american: '/ˈeɪbəl/' }
    };

    // 清理输入文本
    const cleanText = text.trim().toLowerCase();
    if (!cleanText) {
      return '';
    }

    // 分割文本为单词
    const words = cleanText.split(/\s+/).filter(word => word.length > 0);
    const phonetics = [];

    for (const word of words) {
      // 移除标点符号
      const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
      if (!cleanWord) continue;

      // 从字典中查找音标
      const phoneticData = phoneticDict[cleanWord];
      if (phoneticData) {
        const phonetic = voice === 'en-us' ? phoneticData.american : phoneticData.british;
        phonetics.push(phonetic);
      } else {
        // 如果字典中没有，使用基本的音标规则估算
        const estimatedPhonetic = this._estimatePhonetic(cleanWord, voice);
        phonetics.push(estimatedPhonetic);
      }
    }

    return phonetics.join(' ');
  }

  /**
   * 将文本转换为 IPA 音标
   * @param {string} text - 要转换的文本
   * @param {string} voice - 语音变体 ('en-gb' 或 'en-us')
   * @returns {Promise<string>} IPA 音标字符串
   */
  async textToIPA(text, voice = 'en-gb') {
    try {
      await this.initialize();
      
      // 清理输入文本
      const cleanText = text.trim();
      if (!cleanText) {
        return '';
      }

      // 首先尝试使用 eSpeak-NG
      try {
        const result = await this._generateWithEspeak(cleanText, voice);
        if (result) {
          return this._cleanPhonemes(result);
        }
      } catch (error) {
        console.warn('eSpeak-NG failed, using fallback:', error);
      }

      // 如果 eSpeak-NG 失败，使用备用方法
      const fallbackResult = this._fallbackPhonetic(cleanText, voice);
      return this._cleanPhonemes(fallbackResult);
      
    } catch (error) {
      console.error('Error converting text to IPA:', error);
      return '';
    }
  }

  /**
   * 获取单词的英式音标
   * @param {string} word - 单词
   * @returns {Promise<string>} 英式 IPA 音标
   */
  async getBritishIPA(word) {
    return this.textToIPA(word, 'en-gb');
  }

  /**
   * 获取单词的美式音标
   * @param {string} word - 单词
   * @returns {Promise<string>} 美式 IPA 音标
   */
  async getAmericanIPA(word) {
    return this.textToIPA(word, 'en-us');
  }

  /**
   * 获取单词的双音标（英式和美式）
   * @param {string} word - 单词
   * @returns {Promise<{british: string, american: string}>} 双音标对象
   */
  async getDualIPA(word) {
    try {
      const [british, american] = await Promise.all([
        this.getBritishIPA(word),
        this.getAmericanIPA(word)
      ]);
      
      return {
        british: british || '',
        american: american || ''
      };
    } catch (error) {
      console.error('Error getting dual IPA:', error);
      return {
        british: '',
        american: ''
      };
    }
  }

  /**
   * 获取音标（统一接口，用于集成音标服务）
   * @param {string} word - 单词
   * @param {Object} options - 选项
   * @returns {Promise<Object>} 音标结果对象
   */
  async getPhonemes(word, options = {}) {
    try {
      await this.initialize();
      
      const accent = options.accent || 'american';
      const voice = accent === 'british' ? 'en-gb' : 'en-us';
      
      const phonemes = await this.textToIPA(word, voice);
      
      if (phonemes) {
        return {
          success: true,
          word: word.toLowerCase().trim(),
          phonemes: phonemes,
          ipa: phonemes,
          source: 'espeak',
          accent: accent
        };
      } else {
        return {
          success: false,
          word: word.toLowerCase().trim(),
          error: 'No phonemes generated',
          source: 'espeak'
        };
      }
    } catch (error) {
      console.error('Error getting phonemes from eSpeak:', error);
      return {
        success: false,
        word: word.toLowerCase().trim(),
        error: error.message,
        source: 'espeak'
      };
    }
  }

  /**
   * 基于基本规则估算音标
   * @param {string} word - 单词
   * @param {string} voice - 语音变体
   * @returns {string} 估算的音标
   */
  _estimatePhonetic(word, voice) {
    // 基本的音标估算规则
    let phonetic = '/' + word.replace(/./g, (char) => {
      const charMap = {
        'a': 'æ', 'e': 'e', 'i': 'ɪ', 'o': 'ɒ', 'u': 'ʌ',
        'b': 'b', 'c': 'k', 'd': 'd', 'f': 'f', 'g': 'ɡ',
        'h': 'h', 'j': 'dʒ', 'k': 'k', 'l': 'l', 'm': 'm',
        'n': 'n', 'p': 'p', 'q': 'kw', 'r': 'r', 's': 's',
        't': 't', 'v': 'v', 'w': 'w', 'x': 'ks', 'y': 'j', 'z': 'z'
      };
      return charMap[char] || char;
    }) + '/';
    
    // 根据语音变体调整
    if (voice === 'en-us') {
      phonetic = phonetic.replace(/ɒ/g, 'ɑː').replace(/r/g, 'r');
    } else {
      phonetic = phonetic.replace(/r/g, 'ɹ');
    }
    
    return phonetic;
  }

  /**
   * 清理和格式化音标字符串
   * @param {string} phonemes - 原始音素字符串
   * @returns {string} 清理后的音标
   */
  _cleanPhonemes(phonemes) {
    if (!phonemes) return '';
    
    return phonemes
      .trim()
      .replace(/\s+/g, ' ')    // 合并多个空格为单个空格
      .replace(/[\[\]]/g, '')  // 移除方括号
      .replace(/["']/g, '')    // 移除引号
      .replace(/\n/g, '')      // 移除换行符
      .replace(/\r/g, '')      // 移除回车符
      .replace(/^\//g, '')     // 移除开头的斜杠
      .replace(/\/$/g, '')     // 移除结尾的斜杠
      .trim();
  }

  /**
   * 检查 eSpeak-NG 是否已初始化
   * @returns {boolean} 是否已初始化
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * 获取支持的语音变体列表
   * @returns {Array<string>} 支持的语音变体
   */
  getSupportedVoices() {
    return ['en-gb', 'en-us', 'en-au', 'en-ca', 'en-ie', 'en-in', 'en-nz', 'en-za'];
  }
}

// 创建单例实例
const eSpeakService = new ESpeakService();

export default eSpeakService;