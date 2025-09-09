/**
 * 英式发音词级例外表
 * 包含与美式发音不同的英式发音规则和特定单词
 */

/**
 * 英式发音特定单词例外
 * 格式: { word: 'british_ipa' }
 */
export const britishExceptions = {
  // 常见的美英发音差异单词
  'ask': 'ɑːsk',           // 美式: æsk
  'answer': 'ɑːnsə',       // 美式: ænsər
  'after': 'ɑːftə',        // 美式: æftər
  'bath': 'bɑːθ',          // 美式: bæθ
  'path': 'pɑːθ',          // 美式: pæθ
  'laugh': 'lɑːf',         // 美式: læf
  'dance': 'dɑːns',        // 美式: dæns
  'chance': 'tʃɑːns',      // 美式: tʃæns
  'plant': 'plɑːnt',       // 美式: plænt
  'can\'t': 'kɑːnt',       // 美式: kænt
  'half': 'hɑːf',          // 美式: hæf
  'staff': 'stɑːf',        // 美式: stæf
  'class': 'klɑːs',        // 美式: klæs
  'pass': 'pɑːs',          // 美式: pæs
  'fast': 'fɑːst',         // 美式: fæst
  'last': 'lɑːst',         // 美式: læst
  'cast': 'kɑːst',         // 美式: kæst
  'mast': 'mɑːst',         // 美式: mæst
  'vast': 'vɑːst',         // 美式: væst
  'blast': 'blɑːst',       // 美式: blæst
  'master': 'mɑːstə',      // 美式: mæstər
  'disaster': 'dɪzɑːstə',  // 美式: dɪzæstər
  'castle': 'kɑːsəl',      // 美式: kæsəl
  'basket': 'bɑːskɪt',     // 美式: bæskɪt
  'nasty': 'nɑːsti',       // 美式: næsti
  'plastic': 'plɑːstɪk',   // 美式: plæstɪk
  'fantastic': 'fæntæstɪk', // 美式: fæntæstɪk
  
  // R音化差异
  'car': 'kɑː',            // 美式: kɑr
  'far': 'fɑː',            // 美式: fɑr
  'bar': 'bɑː',            // 美式: bɑr
  'star': 'stɑː',          // 美式: stɑr
  'hard': 'hɑːd',          // 美式: hɑrd
  'card': 'kɑːd',          // 美式: kɑrd
  'park': 'pɑːk',          // 美式: pɑrk
  'dark': 'dɑːk',          // 美式: dɑrk
  'mark': 'mɑːk',          // 美式: mɑrk
  'start': 'stɑːt',        // 美式: stɑrt
  'part': 'pɑːt',          // 美式: pɑrt
  'heart': 'hɑːt',         // 美式: hɑrt
  'smart': 'smɑːt',        // 美式: smɑrt
  'chart': 'tʃɑːt',        // 美式: tʃɑrt
  'art': 'ɑːt',            // 美式: ɑrt
  'arm': 'ɑːm',            // 美式: ɑrm
  'farm': 'fɑːm',          // 美式: fɑrm
  'harm': 'hɑːm',          // 美式: hɑrm
  'warm': 'wɔːm',          // 美式: wɔrm
  'form': 'fɔːm',          // 美式: fɔrm
  'storm': 'stɔːm',        // 美式: stɔrm
  'born': 'bɔːn',          // 美式: bɔrn
  'corn': 'kɔːn',          // 美式: kɔrn
  'horn': 'hɔːn',          // 美式: hɔrn
  'worn': 'wɔːn',          // 美式: wɔrn
  'torn': 'tɔːn',          // 美式: tɔrn
  'short': 'ʃɔːt',         // 美式: ʃɔrt
  'sport': 'spɔːt',        // 美式: spɔrt
  'sort': 'sɔːt',          // 美式: sɔrt
  'port': 'pɔːt',          // 美式: pɔrt
  'fort': 'fɔːt',          // 美式: fɔrt
  'court': 'kɔːt',         // 美式: kɔrt
  'four': 'fɔː',           // 美式: fɔr
  'more': 'mɔː',           // 美式: mɔr
  'store': 'stɔː',         // 美式: stɔr
  'before': 'bɪfɔː',       // 美式: bɪfɔr
  'door': 'dɔː',           // 美式: dɔr
  'floor': 'flɔː',         // 美式: flɔr
  'poor': 'pʊə',           // 美式: pʊr
  'sure': 'ʃʊə',           // 美式: ʃʊr
  'pure': 'pjʊə',          // 美式: pjʊr
  'cure': 'kjʊə',          // 美式: kjʊr
  'tour': 'tʊə',           // 美式: tʊr
  'your': 'jɔː',           // 美式: jʊr
  'year': 'jɪə',           // 美式: jɪr
  'near': 'nɪə',           // 美式: nɪr
  'dear': 'dɪə',           // 美式: dɪr
  'clear': 'klɪə',         // 美式: klɪr
  'hear': 'hɪə',           // 美式: hɪr
  'fear': 'fɪə',           // 美式: fɪr
  'beer': 'bɪə',           // 美式: bɪr
  'here': 'hɪə',           // 美式: hɪr
  'there': 'ðeə',          // 美式: ðer
  'where': 'weə',          // 美式: wer
  'care': 'keə',           // 美式: ker
  'share': 'ʃeə',          // 美式: ʃer
  'square': 'skweə',       // 美式: skwer
  'prepare': 'prɪpeə',     // 美式: prɪper
  'compare': 'kəmpeə',     // 美式: kəmper
  'aware': 'əweə',         // 美式: əwer
  'hair': 'heə',           // 美式: her
  'fair': 'feə',           // 美式: fer
  'pair': 'peə',           // 美式: per
  'chair': 'tʃeə',         // 美式: tʃer
  'stair': 'steə',         // 美式: ster
  'air': 'eə',             // 美式: er
  
  // O音差异
  'hot': 'hɒt',            // 美式: hɑt
  'lot': 'lɒt',            // 美式: lɑt
  'not': 'nɒt',            // 美式: nɑt
  'got': 'gɒt',            // 美式: gɑt
  'pot': 'pɒt',            // 美式: pɑt
  'top': 'tɒp',            // 美式: tɑp
  'stop': 'stɒp',          // 美式: stɑp
  'shop': 'ʃɒp',           // 美式: ʃɑp
  'drop': 'drɒp',          // 美式: drɑp
  'clock': 'klɒk',         // 美式: klɑk
  'rock': 'rɒk',           // 美式: rɑk
  'sock': 'sɒk',           // 美式: sɑk
  'lock': 'lɒk',           // 美式: lɑk
  'block': 'blɒk',         // 美式: blɑk
  'shock': 'ʃɒk',          // 美式: ʃɑk
  'knock': 'nɒk',          // 美式: nɑk
  'dog': 'dɒg',            // 美式: dɔg
  'log': 'lɒg',            // 美式: lɔg
  'fog': 'fɒg',            // 美式: fɔg
  'job': 'dʒɒb',           // 美式: dʒɑb
  'rob': 'rɒb',            // 美式: rɑb
  'mob': 'mɒb',            // 美式: mɑb
  'box': 'bɒks',           // 美式: bɑks
  'fox': 'fɒks',           // 美式: fɑks
  'cost': 'kɒst',          // 美式: kɔst
  'lost': 'lɒst',          // 美式: lɔst
  'boss': 'bɒs',           // 美式: bɔs
  'cross': 'krɒs',         // 美式: krɔs
  'office': 'ɒfɪs',        // 美式: ɔfɪs
  'coffee': 'kɒfi',        // 美式: kɔfi
  'often': 'ɒfən',         // 美式: ɔfən
  'soft': 'sɒft',          // 美式: sɔft
  'cloth': 'klɒθ',         // 美式: klɔθ
  'long': 'lɒŋ',           // 美式: lɔŋ
  'song': 'sɒŋ',           // 美式: sɔŋ
  'wrong': 'rɒŋ',          // 美式: rɔŋ
  'strong': 'strɒŋ',       // 美式: strɔŋ
  
  // 其他常见差异
  'tomato': 'təmɑːtəʊ',    // 美式: təmeɪtoʊ
  'potato': 'pəteɪtəʊ',    // 美式: pəteɪtoʊ
  'data': 'deɪtə',         // 美式: dætə
  'pasta': 'pæstə',        // 美式: pɑstə
  'banana': 'bənɑːnə',     // 美式: bənænə
  'garage': 'gærɑːʒ',      // 美式: gərɑʒ
  'vase': 'vɑːz',          // 美式: veɪs
  'route': 'ruːt',         // 美式: raʊt
  'schedule': 'ʃedjuːl',   // 美式: skedʒuːl
  'leisure': 'leʒə',       // 美式: liːʒər
  'either': 'aɪðə',        // 美式: iːðər
  'neither': 'naɪðə',      // 美式: niːðər
  'advertisement': 'ədvɜːtɪsmənt', // 美式: ædvərtaɪzmənt
  'laboratory': 'ləbɒrətri', // 美式: læbrətɔri
  'secretary': 'sekrətri',  // 美式: sekrəteri
  'necessary': 'nesəsri',   // 美式: nesəseri
  'ordinary': 'ɔːdnri',     // 美式: ɔrdəneri
  'military': 'mɪlɪtri',    // 美式: mɪləteri
  'dictionary': 'dɪkʃənri', // 美式: dɪkʃəneri
  'territory': 'terɪtri',   // 美式: terəteri
  'category': 'kætəgri',    // 美式: kætəgɔri
  'ceremony': 'serəməni',   // 美式: serəmoʊni
  'monastery': 'mɒnəstri',  // 美式: mɑnəsteri
  'privacy': 'prɪvəsi',     // 美式: praɪvəsi
  'vitamin': 'vɪtəmɪn',     // 美式: vaɪtəmɪn
  'aluminium': 'æljʊmɪniəm', // 美式: əluːmɪnəm (aluminum)
  'herb': 'hɜːb',           // 美式: ɜrb
  'clerk': 'klɑːk',         // 美式: klɜrk
  'derby': 'dɑːbi',         // 美式: dɜrbi
  'berkeley': 'bɑːkli',     // 美式: bɜrkli
  'lieutenant': 'leftenənt', // 美式: luːtenənt
  'buoy': 'bɔɪ',            // 美式: buːi
  'quay': 'kiː',            // 美式: keɪ
  'sauna': 'sɔːnə',         // 美式: saʊnə
  'yogurt': 'jɒgət',        // 美式: joʊgərt
  'zebra': 'zebrə',         // 美式: ziːbrə
  'missile': 'mɪsaɪl',      // 美式: mɪsəl
  'mobile': 'məʊbaɪl',      // 美式: moʊbəl
  'hostile': 'hɒstaɪl',     // 美式: hɑstəl
  'fertile': 'fɜːtaɪl',     // 美式: fɜrtəl
  'fragile': 'frædʒaɪl',    // 美式: frædʒəl
  'agile': 'ædʒaɪl',        // 美式: ædʒəl
  'docile': 'dəʊsaɪl',      // 美式: dɑsəl
  'sterile': 'steraɪl',     // 美式: sterəl
  'futile': 'fjuːtaɪl',     // 美式: fjuːtəl
  'textile': 'tekstaɪl',    // 美式: tekstəl
  'reptile': 'reptaɪl',     // 美式: reptəl
  'projectile': 'prədʒektaɪl', // 美式: prədʒektəl
  'percentile': 'pəsentaɪl', // 美式: pərsentəl
  'quartile': 'kwɔːtaɪl',   // 美式: kwɔrtəl
  'versatile': 'vɜːsətaɪl', // 美式: vɜrsətəl
  'juvenile': 'dʒuːvənaɪl', // 美式: dʒuːvənəl
  'senile': 'siːnaɪl',      // 美式: siːnəl
  'domicile': 'dɒmɪsaɪl',   // 美式: dɑməsəl
  'reconcile': 'rekənsaɪl', // 美式: rekənsəl
  'compile': 'kəmpaɪl',     // 美式: kəmpaɪl
  'profile': 'prəʊfaɪl',    // 美式: proʊfaɪl
  'meanwhile': 'miːnwaɪl',  // 美式: miːnwaɪl
  'worthwhile': 'wɜːθwaɪl', // 美式: wɜrθwaɪl
};

/**
 * 英式发音规则模式
 * 用于处理系统性的发音差异
 */
export const britishPatterns = {
  // /æ/ -> /ɑː/ 在某些辅音前
  'a_before_fricatives': {
    pattern: /a([fθs])/g,
    replacement: 'ɑː$1',
    examples: ['after', 'bath', 'pass']
  },
  
  // /ɑr/ -> /ɑː/ (R音化)
  'ar_ending': {
    pattern: /ɑr$/g,
    replacement: 'ɑː',
    examples: ['car', 'far', 'bar']
  },
  
  // /ɔr/ -> /ɔː/ (R音化)
  'or_ending': {
    pattern: /ɔr$/g,
    replacement: 'ɔː',
    examples: ['for', 'more', 'door']
  },
  
  // /ɪr/ -> /ɪə/ (R音化)
  'ir_ending': {
    pattern: /ɪr$/g,
    replacement: 'ɪə',
    examples: ['near', 'dear', 'here']
  },
  
  // /ɛr/ -> /eə/ (R音化)
  'er_ending': {
    pattern: /ɛr$/g,
    replacement: 'eə',
    examples: ['care', 'share', 'where']
  },
  
  // /ʊr/ -> /ʊə/ (R音化)
  'ur_ending': {
    pattern: /ʊr$/g,
    replacement: 'ʊə',
    examples: ['sure', 'pure', 'tour']
  },
  
  // /ɑ/ -> /ɒ/ (LOT词汇集)
  'lot_vowel': {
    pattern: /ɑ/g,
    replacement: 'ɒ',
    examples: ['hot', 'lot', 'not'],
    context: 'before_consonant'
  },
  
  // 词尾 -ary, -ery, -ory 的弱化
  'weak_endings': {
    'ary': 'əri',
    'ery': 'əri', 
    'ory': 'əri'
  }
};

/**
 * 获取英式发音例外
 * @param {string} word - 单词
 * @returns {string|null} - 英式IPA音标或null
 */
export function getBritishException(word) {
  const normalizedWord = word.toLowerCase().trim();
  return britishExceptions[normalizedWord] || null;
}

/**
 * 检查是否有英式发音例外
 * @param {string} word - 单词
 * @returns {boolean} - 是否有例外
 */
export function hasBritishException(word) {
  const normalizedWord = word.toLowerCase().trim();
  return normalizedWord in britishExceptions;
}

/**
 * 应用英式发音规则到美式IPA
 * @param {string} americanIPA - 美式IPA音标
 * @param {string} word - 原单词（用于上下文）
 * @returns {string} - 转换后的英式IPA
 */
export function applyBritishRules(americanIPA, word = '') {
  let britishIPA = americanIPA;
  
  // 应用模式规则
  Object.values(britishPatterns).forEach(rule => {
    if (rule.pattern && rule.replacement) {
      britishIPA = britishIPA.replace(rule.pattern, rule.replacement);
    }
  });
  
  // 特殊处理：移除词尾的r音
  britishIPA = britishIPA.replace(/r$/, '');
  britishIPA = britishIPA.replace(/r(?=[^aeiouæɛɪɔʊʌəɑɒ])/g, '');
  
  return britishIPA;
}

/**
 * 获取英式发音统计信息
 * @returns {object} - 统计信息
 */
export function getBritishExceptionStats() {
  const totalExceptions = Object.keys(britishExceptions).length;
  const patternCount = Object.keys(britishPatterns).length;
  
  return {
    totalExceptions,
    patternCount,
    coverage: 'Common British pronunciation differences',
    categories: {
      'TRAP-BATH split': 'Words with /æ/ -> /ɑː/',
      'Rhoticity': 'R-dropping patterns',
      'LOT vowel': '/ɑ/ -> /ɒ/ changes',
      'Weak endings': 'Syllable reduction patterns',
      'Lexical exceptions': 'Word-specific differences'
    }
  };
}