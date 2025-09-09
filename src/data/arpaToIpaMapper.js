/**
 * ARPA到IPA音标映射器
 * 将CMU词典的ARPABET音标转换为国际音标(IPA)
 */

class ArpaToIpaMapper {
  constructor() {
    // ARPABET到IPA的基础映射表
    this.arpaToIpaMap = {
      // 元音 (Vowels)
      'AA': 'ɑː',    // father
      'AE': 'æ',     // cat
      'AH': 'ʌ',     // cut
      'AO': 'ɔː',    // caught
      'AW': 'aʊ',    // cow
      'AY': 'aɪ',    // eye
      'EH': 'e',     // bed
      'ER': 'ɜːr',   // bird (美式)
      'EY': 'eɪ',    // bay
      'IH': 'ɪ',     // bit
      'IY': 'iː',    // beat
      'OW': 'oʊ',    // boat (美式)
      'OY': 'ɔɪ',    // boy
      'UH': 'ʊ',     // book
      'UW': 'uː',    // boot
      
      // 辅音 (Consonants)
      'B': 'b',      // bee
      'CH': 'tʃ',    // cheese
      'D': 'd',      // dee
      'DH': 'ð',     // thee
      'F': 'f',      // fee
      'G': 'ɡ',      // green
      'HH': 'h',     // he
      'JH': 'dʒ',    // gee
      'K': 'k',      // key
      'L': 'l',      // lee
      'M': 'm',      // me
      'N': 'n',      // knee
      'NG': 'ŋ',     // ping
      'P': 'p',      // pee
      'R': 'r',      // read (美式)
      'S': 's',      // sea
      'SH': 'ʃ',     // she
      'T': 't',      // tea
      'TH': 'θ',     // theta
      'V': 'v',      // vee
      'W': 'w',      // we
      'Y': 'j',      // yield
      'Z': 'z',      // zee
      'ZH': 'ʒ'      // seizure
    };

    // 英式发音的特殊映射（覆盖美式）
    this.britishVariants = {
      'ER': 'ɜː',    // bird (英式，无r音)
      'OW': 'əʊ',    // boat (英式)
      'R': 'ɹ',      // read (英式，更准确的r音)
      'AA': 'ɑː',    // father (英式长音)
      'AO': 'ɔː'     // caught (英式)
    };

    // 重音标记
    this.stressMarkers = {
      '0': '',       // 无重音
      '1': 'ˈ',      // 主重音
      '2': 'ˌ'       // 次重音
    };
  }

  /**
   * 将ARPABET音标转换为IPA
   * @param {string} arpaPhonemes - ARPABET音标字符串
   * @param {string} accent - 口音类型 ('us' | 'uk')
   * @returns {string} IPA音标
   */
  convertToIpa(arpaPhonemes, accent = 'us') {
    if (!arpaPhonemes || typeof arpaPhonemes !== 'string') {
      return '';
    }

    // 清理输入，移除多余的空格和标点
    const cleanArpa = arpaPhonemes.trim().toUpperCase();
    
    // 分割音素
    const phonemes = cleanArpa.split(/\s+/);
    
    let ipaResult = [];
    let currentStress = '';

    for (const phoneme of phonemes) {
      if (!phoneme) continue;

      // 提取重音信息
      const stressMatch = phoneme.match(/([A-Z]+)(\d?)/);
      if (!stressMatch) continue;

      const [, basePhoneme, stress] = stressMatch;
      
      // 处理重音标记
      if (stress && this.stressMarkers[stress]) {
        currentStress = this.stressMarkers[stress];
      }

      // 选择映射表（英式或美式）
      const mapping = accent === 'uk' && this.britishVariants[basePhoneme] 
        ? this.britishVariants[basePhoneme]
        : this.arpaToIpaMap[basePhoneme];

      if (mapping) {
        // 添加重音标记到元音前
        if (currentStress && this.isVowel(basePhoneme)) {
          ipaResult.push(currentStress + mapping);
          currentStress = ''; // 重音标记只用一次
        } else {
          ipaResult.push(mapping);
        }
      } else {
        console.warn(`Unknown ARPA phoneme: ${basePhoneme}`);
        ipaResult.push(basePhoneme.toLowerCase());
      }
    }

    return '/' + ipaResult.join('') + '/';
  }

  /**
   * 检查是否为元音
   * @param {string} phoneme - ARPABET音素
   * @returns {boolean}
   */
  isVowel(phoneme) {
    const vowels = ['AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW'];
    return vowels.includes(phoneme);
  }

  /**
   * 批量转换多个单词的音标
   * @param {Object} arpaDict - ARPABET词典对象 {word: arpaPhonemes}
   * @param {string} accent - 口音类型
   * @returns {Object} IPA词典对象 {word: ipaPhonemes}
   */
  convertDictionary(arpaDict, accent = 'us') {
    const ipaDict = {};
    
    for (const [word, arpaPhonemes] of Object.entries(arpaDict)) {
      ipaDict[word] = this.convertToIpa(arpaPhonemes, accent);
    }
    
    return ipaDict;
  }

  /**
   * 获取支持的ARPABET音素列表
   * @returns {Array<string>}
   */
  getSupportedPhonemes() {
    return Object.keys(this.arpaToIpaMap);
  }

  /**
   * 验证ARPABET音标格式
   * @param {string} arpaPhonemes - ARPABET音标
   * @returns {boolean}
   */
  validateArpaFormat(arpaPhonemes) {
    if (!arpaPhonemes || typeof arpaPhonemes !== 'string') {
      return false;
    }

    const phonemes = arpaPhonemes.trim().toUpperCase().split(/\s+/);
    
    for (const phoneme of phonemes) {
      const basePhoneme = phoneme.replace(/\d$/, '');
      if (!this.arpaToIpaMap[basePhoneme]) {
        return false;
      }
    }
    
    return true;
  }
}

// 创建单例实例
const arpaToIpaMapper = new ArpaToIpaMapper();

export default arpaToIpaMapper;