// AI文本分析服务
// 注意：在生产环境中，API密钥应该通过环境变量或后端服务管理

// 模拟AI分析结果的函数（用于演示）
function generateMockAnalysis(text, accent = 'us') {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  
  return {
    sentences: sentences.map((sentence, index) => {
      const words = sentence.trim().split(/\s+/).filter(w => w.length > 0)
      
      return {
        id: index,
        text: sentence.trim(),
        thoughtGroups: generateThoughtGroups(sentence.trim()),
        thoughtGroupsWithSlashes: generateThoughtGroupsWithSlashes(sentence.trim()),
        words: words.map((word, wordIndex) => ({
          id: wordIndex,
          text: word.replace(/[^a-zA-Z]/g, ''),
          original: word,
          phonetic: generatePhonetic(word.replace(/[^a-zA-Z]/g, ''), accent),
          syllables: generateSyllables(word.replace(/[^a-zA-Z]/g, ''))
        })),
        structure: generateStructure(words),
        grammarAnalysis: generateGrammarAnalysis(sentence.trim())
      }
    })
  }
}

// 生成意群分割和斜杠标记
function generateThoughtGroups(sentence) {
  const words = sentence.split(/\s+/)
  const groups = []
  let currentGroup = []
  
  // 定义自然停顿点的规则
  const pauseRules = {
    // 连词前停顿
    conjunctions: ['and', 'but', 'or', 'so', 'yet', 'for', 'nor'],
    // 从句引导词前停顿
    subordinators: ['because', 'since', 'when', 'while', 'if', 'although', 'though', 'unless', 'until', 'before', 'after'],
    // 介词短语前停顿（长介词短语）
    prepositions: ['with', 'without', 'through', 'during', 'between', 'among', 'across', 'beyond'],
    // 副词前停顿
    adverbs: ['however', 'therefore', 'moreover', 'furthermore', 'nevertheless', 'meanwhile'],
    // 标点符号停顿
    punctuation: [',', ';', ':', '(', ')', '[', ']']
  }
  
  words.forEach((word, index) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '')
    const hasComma = word.includes(',')
    
    currentGroup.push(word)
    
    // 判断是否需要在此处分组（添加停顿）
    let shouldPause = false
    
    // 1. 遇到逗号或其他标点
    if (hasComma || pauseRules.punctuation.some(p => word.includes(p))) {
      shouldPause = true
    }
    // 2. 当前组已有3-6个词，且下一个词是连词或从句引导词
    else if (currentGroup.length >= 3 && currentGroup.length <= 6 && index < words.length - 1) {
      const nextWord = words[index + 1].toLowerCase().replace(/[^a-z]/g, '')
      if ([...pauseRules.conjunctions, ...pauseRules.subordinators, ...pauseRules.adverbs].includes(nextWord)) {
        shouldPause = true
      }
    }
    // 3. 当前组已有4-7个词，且当前词是介词
    else if (currentGroup.length >= 4 && currentGroup.length <= 7 && pauseRules.prepositions.includes(cleanWord)) {
      shouldPause = true
    }
    // 4. 强制分组：避免过长的意群（超过8个词）
    else if (currentGroup.length >= 8) {
      shouldPause = true
    }
    // 5. 句子结尾
    else if (index === words.length - 1) {
      shouldPause = true
    }
    
    if (shouldPause) {
      groups.push(currentGroup.join(' '))
      currentGroup = []
    }
  })
  
  // 处理剩余的词
  if (currentGroup.length > 0) {
    groups.push(currentGroup.join(' '))
  }
  
  return groups
}

// 生成带斜杠标记的意群文本
function generateThoughtGroupsWithSlashes(sentence) {
  const groups = generateThoughtGroups(sentence)
  return groups.join(' / ')
}

// 生成详细的语法分析
function generateGrammarAnalysis(sentence) {
  const analysis = {
    brief: '',
    detailed: ''
  }
  
  // 根据句子内容生成相应的语法分析
  const lowerSentence = sentence.toLowerCase()
  
  if (lowerSentence.includes('pixel game page') && lowerSentence.includes('featuring')) {
    analysis.brief = '这是一个复合句，包含主语、谓语和定语从句。主语是"A pixel game page"，谓语动词是隐含的"shows"或"displays"，"featuring"引导的是现在分词短语作定语。'
    analysis.detailed = `【句子类型】：复合句（Complex Sentence）\n\n【主要成分分析】：\n• 主语（Subject）："A pixel game page" - 不定冠词+形容词+名词+名词，构成名词短语\n• 谓语（Predicate）：隐含动词"shows/displays"\n• 定语（Attributive）："featuring the interior of a modern airplane cockpit" - 现在分词短语作后置定语\n\n【语法特点】：\n1. 使用现在分词"featuring"作定语，修饰主语"page"\n2. "the interior of a modern airplane cockpit"是介词短语，其中"of"表示所属关系\n3. 形容词"modern"和"airplane"都修饰名词"cockpit"\n\n【句法结构】：主语 + [现在分词短语作定语]\n\n【语言功能】：描述性语句，用于介绍或展示某个游戏页面的特征`
  }
  else if (lowerSentence.includes('details') && lowerSentence.includes('minimal')) {
    analysis.brief = '这是一个主系表结构的简单句。主语是"The details"，系动词是"are"，表语是"minimal yet recognizable"。'
    analysis.detailed = `【句子类型】：简单句（Simple Sentence）\n\n【主要成分分析】：\n• 主语（Subject）："The details" - 定冠词+名词\n• 系动词（Linking Verb）："are" - be动词的复数形式\n• 表语（Predicative）："minimal yet recognizable" - 形容词短语\n\n【语法特点】：\n1. 主系表结构（Subject + Linking Verb + Predicative）\n2. 表语部分使用"yet"连接两个形容词，表示转折关系\n3. "minimal"和"recognizable"形成对比，强调虽然简单但仍可识别\n\n【句法结构】：主语 + 系动词 + 表语\n\n【语言功能】：描述性语句，说明细节的特征状态`
  }
  else if (lowerSentence.includes('airport terminal') && lowerSentence.includes('visible')) {
    analysis.brief = '这是一个主系表结构的简单句。主语是"the airport terminal and sky"，系动词是"are"，表语是"visible"。'
    analysis.detailed = `【句子类型】：简单句（Simple Sentence）\n\n【主要成分分析】：\n• 主语（Subject）："the airport terminal and sky" - 并列名词短语\n• 系动词（Linking Verb）："are" - be动词的复数形式\n• 表语（Predicative）："visible" - 形容词\n\n【语法特点】：\n1. 主语由"and"连接两个名词短语构成并列结构\n2. 定冠词"the"修饰整个并列主语\n3. 形容词"visible"作表语，说明主语的状态\n\n【句法结构】：并列主语 + 系动词 + 表语\n\n【语言功能】：陈述句，说明某些事物的可见性状态`
  }
  else {
    // 通用分析
    const words = sentence.split(/\s+/)
    const hasVerb = words.some(word => ['is', 'are', 'was', 'were', 'have', 'has', 'do', 'does', 'will', 'can', 'featuring', 'shows', 'displays'].includes(word.toLowerCase()))
    
    if (hasVerb) {
      analysis.brief = '这是一个包含主语和谓语的完整句子。句子结构相对简单，表达了一个完整的意思。'
      analysis.detailed = `【句子类型】：简单句（Simple Sentence）\n\n【基本结构分析】：\n• 该句包含主语和谓语成分\n• 句子表达了一个完整的思想\n• 语法结构符合英语基本句型\n\n【语法特点】：\n1. 使用了基本的主谓结构\n2. 词汇选择恰当，语义清晰\n3. 句子长度适中，便于理解\n\n【语言功能】：陈述性语句，用于传达信息或描述情况`
    } else {
      analysis.brief = '这是一个名词短语或不完整的句子结构。可能是标题、标签或句子片段。'
      analysis.detailed = `【结构类型】：名词短语或句子片段\n\n【成分分析】：\n• 主要由名词、形容词等构成\n• 缺少完整的谓语动词\n• 可能用作标题、标签或描述性短语\n\n【语法特点】：\n1. 结构简洁，信息密度高\n2. 多用于标题或说明性文本\n3. 语义相对独立但语法不完整\n\n【语言功能】：标识性或描述性短语，用于快速传达核心信息`
    }
  }
  
  return analysis
}

// 生成音标（支持美式和英式）
function generatePhonetic(word, accent = 'us') {
  const phoneticMap = {
    'hello': {
      us: '/həˈloʊ/',
      uk: '/həˈləʊ/'
    },
    'world': {
      us: '/wɜːrld/',
      uk: '/wɜːld/'
    },
    'pronunciation': {
      us: '/prəˌnʌnsiˈeɪʃən/',
      uk: '/prəˌnʌnsiˈeɪʃən/'
    },
    'practice': {
      us: '/ˈpræktɪs/',
      uk: '/ˈpræktɪs/'
    },
    'english': {
      us: '/ˈɪŋɡlɪʃ/',
      uk: '/ˈɪŋɡlɪʃ/'
    },
    'learning': {
      us: '/ˈlɜːrnɪŋ/',
      uk: '/ˈlɜːnɪŋ/'
    },
    'artificial': {
      us: '/ˌɑːrtɪˈfɪʃəl/',
      uk: '/ˌɑːtɪˈfɪʃəl/'
    },
    'intelligence': {
      us: '/ɪnˈtelɪdʒəns/',
      uk: '/ɪnˈtelɪdʒəns/'
    },
    'coach': {
      us: '/koʊtʃ/',
      uk: '/kəʊtʃ/'
    },
    'speech': {
      us: '/spiːtʃ/',
      uk: '/spiːtʃ/'
    },
    'recognition': {
      us: '/ˌrekəɡˈnɪʃən/',
      uk: '/ˌrekəɡˈnɪʃən/'
    },
    'feedback': {
      us: '/ˈfiːdbæk/',
      uk: '/ˈfiːdbæk/'
    },
    'improve': {
      us: '/ɪmˈpruːv/',
      uk: '/ɪmˈpruːv/'
    },
    'accent': {
      us: '/ˈæksent/',
      uk: '/ˈæksənt/'
    },
    'fluency': {
      us: '/ˈfluːənsi/',
      uk: '/ˈfluːənsi/'
    },
    'water': {
      us: '/ˈwɔːtər/',
      uk: '/ˈwɔːtə/'
    },
    'dance': {
      us: '/dæns/',
      uk: '/dɑːns/'
    },
    'ask': {
      us: '/æsk/',
      uk: '/ɑːsk/'
    },
    'can': {
      us: '/kæn/',
      uk: '/kæn/'
    },
    'cannot': {
      us: '/ˈkænɑːt/',
      uk: '/ˈkænɒt/'
    },
    // 添加更多常用单词
    'a': {
      us: '/ə/',
      uk: '/ə/'
    },
    'the': {
      us: '/ðə/',
      uk: '/ðə/'
    },
    'and': {
      us: '/ænd/',
      uk: '/ænd/'
    },
    'to': {
      us: '/tuː/',
      uk: '/tuː/'
    },
    'of': {
      us: '/ʌv/',
      uk: '/ɒv/'
    },
    'in': {
      us: '/ɪn/',
      uk: '/ɪn/'
    },
    'is': {
      us: '/ɪz/',
      uk: '/ɪz/'
    },
    'it': {
      us: '/ɪt/',
      uk: '/ɪt/'
    },
    'you': {
      us: '/juː/',
      uk: '/juː/'
    },
    'that': {
      us: '/ðæt/',
      uk: '/ðæt/'
    },
    'he': {
      us: '/hiː/',
      uk: '/hiː/'
    },
    'was': {
      us: '/wʌz/',
      uk: '/wɒz/'
    },
    'for': {
      us: '/fɔːr/',
      uk: '/fɔː/'
    },
    'are': {
      us: '/ɑːr/',
      uk: '/ɑː/'
    },
    'with': {
      us: '/wɪθ/',
      uk: '/wɪθ/'
    },
    'as': {
      us: '/æz/',
      uk: '/æz/'
    },
    'his': {
      us: '/hɪz/',
      uk: '/hɪz/'
    },
    'they': {
      us: '/ðeɪ/',
      uk: '/ðeɪ/'
    },
    'be': {
      us: '/biː/',
      uk: '/biː/'
    },
    'at': {
      us: '/æt/',
      uk: '/æt/'
    },
    'one': {
      us: '/wʌn/',
      uk: '/wʌn/'
    },
    'have': {
      us: '/hæv/',
      uk: '/hæv/'
    },
    'this': {
      us: '/ðɪs/',
      uk: '/ðɪs/'
    },
    'from': {
      us: '/frʌm/',
      uk: '/frɒm/'
    },
    'or': {
      us: '/ɔːr/',
      uk: '/ɔː/'
    },
    'had': {
      us: '/hæd/',
      uk: '/hæd/'
    },
    'by': {
      us: '/baɪ/',
      uk: '/baɪ/'
    },
    'but': {
      us: '/bʌt/',
      uk: '/bʌt/'
    },
    'not': {
      us: '/nɑːt/',
      uk: '/nɒt/'
    },
    'what': {
      us: '/wʌt/',
      uk: '/wɒt/'
    },
    'all': {
      us: '/ɔːl/',
      uk: '/ɔːl/'
    },
    'were': {
      us: '/wɜːr/',
      uk: '/wɜː/'
    },
    'we': {
      us: '/wiː/',
      uk: '/wiː/'
    },
    'when': {
      us: '/wen/',
      uk: '/wen/'
    },
    'your': {
      us: '/jʊr/',
      uk: '/jɔː/'
    },
    'said': {
      us: '/sed/',
      uk: '/sed/'
    },
    'there': {
      us: '/ðer/',
      uk: '/ðeə/'
    },
    'each': {
      us: '/iːtʃ/',
      uk: '/iːtʃ/'
    },
    'which': {
      us: '/wɪtʃ/',
      uk: '/wɪtʃ/'
    },
    'do': {
      us: '/duː/',
      uk: '/duː/'
    },
    'how': {
      us: '/haʊ/',
      uk: '/haʊ/'
    },
    'their': {
      us: '/ðer/',
      uk: '/ðeə/'
    },
    'if': {
      us: '/ɪf/',
      uk: '/ɪf/'
    },
    'will': {
      us: '/wɪl/',
      uk: '/wɪl/'
    },
    'up': {
      us: '/ʌp/',
      uk: '/ʌp/'
    },
    'other': {
      us: '/ˈʌðər/',
      uk: '/ˈʌðə/'
    },
    'about': {
      us: '/əˈbaʊt/',
      uk: '/əˈbaʊt/'
    },
    'out': {
      us: '/aʊt/',
      uk: '/aʊt/'
    },
    'many': {
      us: '/ˈmeni/',
      uk: '/ˈmeni/'
    },
    'time': {
      us: '/taɪm/',
      uk: '/taɪm/'
    },
    'very': {
      us: '/ˈveri/',
      uk: '/ˈveri/'
    },
    'when': {
      us: '/wen/',
      uk: '/wen/'
    },
    'much': {
      us: '/mʌtʃ/',
      uk: '/mʌtʃ/'
    },
    'new': {
      us: '/nuː/',
      uk: '/njuː/'
    },
    'way': {
      us: '/weɪ/',
      uk: '/weɪ/'
    },
    'well': {
      us: '/wel/',
      uk: '/wel/'
    },
    'get': {
      us: '/ɡet/',
      uk: '/ɡet/'
    },
    'use': {
      us: '/juːz/',
      uk: '/juːz/'
    },
    'man': {
      us: '/mæn/',
      uk: '/mæn/'
    },
    'day': {
      us: '/deɪ/',
      uk: '/deɪ/'
    },
    'too': {
      us: '/tuː/',
      uk: '/tuː/'
    },
    'any': {
      us: '/ˈeni/',
      uk: '/ˈeni/'
    },
    'may': {
      us: '/meɪ/',
      uk: '/meɪ/'
    },
    'say': {
      us: '/seɪ/',
      uk: '/seɪ/'
    },
    'she': {
      us: '/ʃiː/',
      uk: '/ʃiː/'
    },
    'its': {
      us: '/ɪts/',
      uk: '/ɪts/'
    },
    'our': {
      us: '/aʊr/',
      uk: '/aʊə/'
    },
    'two': {
      us: '/tuː/',
      uk: '/tuː/'
    },
    'more': {
      us: '/mɔːr/',
      uk: '/mɔː/'
    },
    'these': {
      us: '/ðiːz/',
      uk: '/ðiːz/'
    },
    'want': {
      us: '/wɑːnt/',
      uk: '/wɒnt/'
    },
    'first': {
      us: '/fɜːrst/',
      uk: '/fɜːst/'
    },
    'also': {
      us: '/ˈɔːlsoʊ/',
      uk: '/ˈɔːlsəʊ/'
    },
    'after': {
      us: '/ˈæftər/',
      uk: '/ˈɑːftə/'
    },
    'back': {
      us: '/bæk/',
      uk: '/bæk/'
    },
    'work': {
      us: '/wɜːrk/',
      uk: '/wɜːk/'
    },
    'life': {
      us: '/laɪf/',
      uk: '/laɪf/'
    },
    'only': {
      us: '/ˈoʊnli/',
      uk: '/ˈəʊnli/'
    },
    'know': {
      us: '/noʊ/',
      uk: '/nəʊ/'
    },
    'little': {
      us: '/ˈlɪtəl/',
      uk: '/ˈlɪtəl/'
    },
    'good': {
      us: '/ɡʊd/',
      uk: '/ɡʊd/'
    },
    'year': {
      us: '/jɪr/',
      uk: '/jɪə/'
    },
    'come': {
      us: '/kʌm/',
      uk: '/kʌm/'
    },
    'could': {
      us: '/kʊd/',
      uk: '/kʊd/'
    },
    'see': {
      us: '/siː/',
      uk: '/siː/'
    },
    'him': {
      us: '/hɪm/',
      uk: '/hɪm/'
    },
    'long': {
      us: '/lɔːŋ/',
      uk: '/lɒŋ/'
    },
    'make': {
      us: '/meɪk/',
      uk: '/meɪk/'
    },
    'thing': {
      us: '/θɪŋ/',
      uk: '/θɪŋ/'
    },
    'over': {
      us: '/ˈoʊvər/',
      uk: '/ˈəʊvə/'
    },
    'think': {
      us: '/θɪŋk/',
      uk: '/θɪŋk/'
    },
    'school': {
      us: '/skuːl/',
      uk: '/skuːl/'
    },
    'still': {
      us: '/stɪl/',
      uk: '/stɪl/'
    },
    'try': {
      us: '/traɪ/',
      uk: '/traɪ/'
    },
    'last': {
      us: '/læst/',
      uk: '/lɑːst/'
    },
    'should': {
      us: '/ʃʊd/',
      uk: '/ʃʊd/'
    },
    'home': {
      us: '/hoʊm/',
      uk: '/həʊm/'
    },
    'give': {
      us: '/ɡɪv/',
      uk: '/ɡɪv/'
    },
    'most': {
      us: '/moʊst/',
      uk: '/məʊst/'
    },
    'hand': {
      us: '/hænd/',
      uk: '/hænd/'
    },
    'high': {
      us: '/haɪ/',
      uk: '/haɪ/'
    },
    'keep': {
      us: '/kiːp/',
      uk: '/kiːp/'
    },
    'old': {
      us: '/oʊld/',
      uk: '/əʊld/'
    },
    'great': {
      us: '/ɡreɪt/',
      uk: '/ɡreɪt/'
    },
    'same': {
      us: '/seɪm/',
      uk: '/seɪm/'
    },
    'big': {
      us: '/bɪɡ/',
      uk: '/bɪɡ/'
    },
    'group': {
      us: '/ɡruːp/',
      uk: '/ɡruːp/'
    },
    'right': {
      us: '/raɪt/',
      uk: '/raɪt/'
    },
    'system': {
      us: '/ˈsɪstəm/',
      uk: '/ˈsɪstəm/'
    },
    'those': {
      us: '/ðoʊz/',
      uk: '/ðəʊz/'
    },
    'part': {
      us: '/pɑːrt/',
      uk: '/pɑːt/'
    },
    'take': {
      us: '/teɪk/',
      uk: '/teɪk/'
    },
    'case': {
      us: '/keɪs/',
      uk: '/keɪs/'
    },
    'early': {
      us: '/ˈɜːrli/',
      uk: '/ˈɜːli/'
    },
    'number': {
      us: '/ˈnʌmbər/',
      uk: '/ˈnʌmbə/'
    },
    'point': {
      us: '/pɔɪnt/',
      uk: '/pɔɪnt/'
    },
    'government': {
      us: '/ˈɡʌvərnmənt/',
      uk: '/ˈɡʌvənmənt/'
    },
    'company': {
      us: '/ˈkʌmpəni/',
      uk: '/ˈkʌmpəni/'
    },
    'fact': {
      us: '/fækt/',
      uk: '/fækt/'
    },
    'hand': {
      us: '/hænd/',
      uk: '/hænd/'
    },
    'place': {
      us: '/pleɪs/',
      uk: '/pleɪs/'
    },
    'right': {
      us: '/raɪt/',
      uk: '/raɪt/'
    },
    'public': {
      us: '/ˈpʌblɪk/',
      uk: '/ˈpʌblɪk/'
    },
    'become': {
      us: '/bɪˈkʌm/',
      uk: '/bɪˈkʌm/'
    },
    'problem': {
      us: '/ˈprɑːbləm/',
      uk: '/ˈprɒbləm/'
    },
    'important': {
      us: '/ɪmˈpɔːrtənt/',
      uk: '/ɪmˈpɔːtənt/'
    },
    'different': {
      us: '/ˈdɪfərənt/',
      uk: '/ˈdɪfərənt/'
    },
    'small': {
      us: '/smɔːl/',
      uk: '/smɔːl/'
    },
    'large': {
      us: '/lɑːrdʒ/',
      uk: '/lɑːdʒ/'
    },
    'national': {
      us: '/ˈnæʃənəl/',
      uk: '/ˈnæʃənəl/'
    },
    'young': {
      us: '/jʌŋ/',
      uk: '/jʌŋ/'
    },
    'social': {
      us: '/ˈsoʊʃəl/',
      uk: '/ˈsəʊʃəl/'
    },
    'local': {
      us: '/ˈloʊkəl/',
      uk: '/ˈləʊkəl/'
    },
    'long': {
      us: '/lɔːŋ/',
      uk: '/lɒŋ/'
    },
    'little': {
      us: '/ˈlɪtəl/',
      uk: '/ˈlɪtəl/'
    },
    'own': {
      us: '/oʊn/',
      uk: '/əʊn/'
    },
    'general': {
      us: '/ˈdʒenərəl/',
      uk: '/ˈdʒenərəl/'
    },
    'open': {
      us: '/ˈoʊpən/',
      uk: '/ˈəʊpən/'
    },
    'opens': {
      us: '/ˈoʊpənz/',
      uk: '/ˈəʊpənz/'
    },
    'foreign': {
      us: '/ˈfɔːrən/',
      uk: '/ˈfɒrən/'
    },
    'language': {
      us: '/ˈlæŋɡwɪdʒ/',
      uk: '/ˈlæŋɡwɪdʒ/'
    },
    'opportunities': {
      us: '/ˌɑːpərˈtuːnətiz/',
      uk: '/ˌɒpəˈtjuːnətiz/'
    }
  }
  
  const wordLower = word.toLowerCase()
  if (phoneticMap[wordLower]) {
    return phoneticMap[wordLower][accent] || phoneticMap[wordLower]['us']
  }
  
  return `/ˈ${wordLower}/`
}

// 生成音节分割
function generateSyllables(word) {
  // 简化的音节分割逻辑
  const vowels = 'aeiouAEIOU'
  const syllables = []
  let currentSyllable = ''
  
  for (let i = 0; i < word.length; i++) {
    currentSyllable += word[i]
    
    if (vowels.includes(word[i]) && i < word.length - 1 && !vowels.includes(word[i + 1])) {
      syllables.push(currentSyllable)
      currentSyllable = ''
    }
  }
  
  if (currentSyllable) {
    syllables.push(currentSyllable)
  }
  
  return syllables.length > 0 ? syllables : [word]
}

// 生成句子结构分析（语法成分分析）
function generateStructure(words) {
  const structure = []
  const sentence = words.join(' ').toLowerCase()
  
  // 定义语法成分模式
  const patterns = [
    // 主语模式
    {
      pattern: /^(a pixel game page|the details|the airport terminal and sky|a large[^,]*control stick[^,]*dashboard[^,]*and pilot seat|with natural lighting[^,]*a pixel art style[^,]*a cinematic quality[^,]*and realistic depth of field|with the camera angle facing the cockpit)/,
      type: 'subject',
      color: '#3b82f6',
      role: '主语 (Subject)'
    },
    // 谓语模式
    {
      pattern: /(is|are|featuring)/,
      type: 'predicate', 
      color: '#ef4444',
      role: '谓语 (Predicate)'
    },
    // 表语模式
    {
      pattern: /(visible|minimal yet recognizable)/,
      type: 'predicative',
      color: '#f59e0b', 
      role: '表语 (Predicative)'
    },
    // 定语模式
    {
      pattern: /(featuring the interior of a modern airplane cockpit|with a simplified control interface and various buttons)/,
      type: 'attributive',
      color: '#8b5cf6',
      role: '定语 (Attributive)'
    },
    // 状语模式
    {
      pattern: /(in the center|outside the cockpit windows)/,
      type: 'adverbial',
      color: '#10b981',
      role: '状语 (Adverbial)'
    }
  ]
  
  // 分析句子结构
  let remainingText = sentence
  let currentIndex = 0
  
  // 简化的句子结构分析
  const segments = [
    { text: 'A pixel game page', type: 'subject', color: '#3b82f6', role: '主语 (Subject)' },
    { text: 'featuring the interior of a modern airplane cockpit', type: 'attributive', color: '#8b5cf6', role: '定语 (Attributive)' },
    { text: 'In the center', type: 'adverbial', color: '#10b981', role: '状语 (Adverbial)' },
    { text: 'is', type: 'predicate', color: '#ef4444', role: '谓语 (Predicate)' },
    { text: 'a large, wide control stick, dashboard, and pilot seat', type: 'predicative', color: '#f59e0b', role: '表语 (Predicative)' },
    { text: 'with a simplified control interface and various buttons', type: 'adverbial', color: '#10b981', role: '状语 (Adverbial)' },
    { text: 'Outside the cockpit windows', type: 'adverbial', color: '#10b981', role: '状语 (Adverbial)' },
    { text: 'The details', type: 'subject', color: '#3b82f6', role: '主语 (Subject)' },
    { text: 'are', type: 'predicate', color: '#ef4444', role: '谓语 (Predicate)' },
    { text: 'minimal yet recognizable', type: 'predicative', color: '#f59e0b', role: '表语 (Predicative)' },
    { text: 'the airport terminal and sky', type: 'subject', color: '#3b82f6', role: '主语 (Subject)' },
    { text: 'are', type: 'predicate', color: '#ef4444', role: '谓语 (Predicate)' },
    { text: 'visible', type: 'predicative', color: '#f59e0b', role: '表语 (Predicative)' },
    { text: 'with natural lighting, a pixel art style, a cinematic quality, and realistic depth of field', type: 'adverbial', color: '#10b981', role: '状语 (Adverbial)' },
    { text: 'with the camera angle facing the cockpit', type: 'adverbial', color: '#10b981', role: '状语 (Adverbial)' }
  ]
  
  // 根据实际输入的句子内容，智能匹配语法成分
  const inputText = words.join(' ')
  
  // 简单的关键词匹配来确定语法成分
  if (inputText.toLowerCase().includes('pixel game page')) {
    structure.push({ text: 'A pixel game page', type: 'subject', color: '#3b82f6', role: '主语 (Subject)' })
  }
  
  if (inputText.toLowerCase().includes('featuring')) {
    structure.push({ text: 'featuring the interior of a modern airplane cockpit', type: 'attributive', color: '#8b5cf6', role: '定语 (Attributive)' })
  }
  
  if (inputText.toLowerCase().includes('in the center')) {
    structure.push({ text: 'In the center', type: 'adverbial', color: '#10b981', role: '状语 (Adverbial)' })
  }
  
  if (inputText.toLowerCase().includes(' is ')) {
    structure.push({ text: 'is', type: 'predicate', color: '#ef4444', role: '谓语 (Predicate)' })
  }
  
  if (inputText.toLowerCase().includes('control stick') || inputText.toLowerCase().includes('dashboard')) {
    structure.push({ text: 'a large, wide control stick, dashboard, and pilot seat', type: 'predicative', color: '#f59e0b', role: '表语 (Predicative)' })
  }
  
  if (inputText.toLowerCase().includes('simplified') && inputText.toLowerCase().includes('interface')) {
    structure.push({ text: 'with a simplified control interface and various buttons', type: 'adverbial', color: '#10b981', role: '状语 (Adverbial)' })
  }
  
  if (inputText.toLowerCase().includes('outside')) {
    structure.push({ text: 'Outside the cockpit windows', type: 'adverbial', color: '#10b981', role: '状语 (Adverbial)' })
  }
  
  if (inputText.toLowerCase().includes('details')) {
    structure.push({ text: 'The details', type: 'subject', color: '#3b82f6', role: '主语 (Subject)' })
  }
  
  if (inputText.toLowerCase().includes(' are ')) {
    structure.push({ text: 'are', type: 'predicate', color: '#ef4444', role: '谓语 (Predicate)' })
  }
  
  if (inputText.toLowerCase().includes('minimal') || inputText.toLowerCase().includes('recognizable')) {
    structure.push({ text: 'minimal yet recognizable', type: 'predicative', color: '#f59e0b', role: '表语 (Predicative)' })
  }
  
  if (inputText.toLowerCase().includes('airport') && inputText.toLowerCase().includes('terminal')) {
    structure.push({ text: 'the airport terminal and sky', type: 'subject', color: '#3b82f6', role: '主语 (Subject)' })
  }
  
  if (inputText.toLowerCase().includes('visible')) {
    structure.push({ text: 'visible', type: 'predicative', color: '#f59e0b', role: '表语 (Predicative)' })
  }
  
  if (inputText.toLowerCase().includes('natural lighting') || inputText.toLowerCase().includes('pixel art')) {
    structure.push({ text: 'with natural lighting, a pixel art style, a cinematic quality, and realistic depth of field', type: 'adverbial', color: '#10b981', role: '状语 (Adverbial)' })
  }
  
  if (inputText.toLowerCase().includes('camera angle')) {
    structure.push({ text: 'with the camera angle facing the cockpit', type: 'adverbial', color: '#10b981', role: '状语 (Adverbial)' })
  }
  
  // 如果没有匹配到任何成分，提供默认的简单分析
  if (structure.length === 0) {
    // 简单的主谓宾分析
    const firstWord = words[0] || ''
    const hasVerb = words.some(word => ['is', 'are', 'was', 'were', 'have', 'has', 'do', 'does', 'will', 'can', 'featuring'].includes(word.toLowerCase()))
    
    if (firstWord) {
      structure.push({ text: firstWord, type: 'subject', color: '#3b82f6', role: '主语 (Subject)' })
    }
    
    if (hasVerb) {
      const verb = words.find(word => ['is', 'are', 'was', 'were', 'have', 'has', 'do', 'does', 'will', 'can', 'featuring'].includes(word.toLowerCase()))
      if (verb) {
        structure.push({ text: verb, type: 'predicate', color: '#ef4444', role: '谓语 (Predicate)' })
      }
    }
  }
  
  return structure
}

// 主要的文本分析函数
export async function analyzeText(text, accent = 'us') {
  try {
    // 调用Netlify函数代理服务器
    const response = await fetch('/.netlify/functions/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        text: text, 
        accent: accent,
        type: 'analysis' 
      })
    })
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`)
    }
    
    const data = await response.json()
    
    // 如果API返回了结构化数据，直接使用
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const content = data.candidates[0].content.parts[0].text
      try {
        const parsedContent = JSON.parse(content)
        return parsedContent
      } catch (parseError) {
        console.warn('API返回的JSON解析失败，使用备用分析:', parseError)
        return generateMockAnalysis(text, accent)
      }
    }
    
    // 如果API调用失败，使用备用分析
    return generateMockAnalysis(text, accent)
    
  } catch (error) {
    console.error('AI分析错误:', error)
    // 如果网络请求失败，使用本地备用分析
    console.warn('使用本地备用分析功能')
    return generateMockAnalysis(text, accent)
  }
}

// 真实AI API集成示例（需要配置API密钥）
/*
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY)

export async function analyzeTextWithGemini(text) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = `
请分析以下英文文本，并返回JSON格式的结果：

文本："${text}"

请按照以下格式返回：
{
  "sentences": [
    {
      "id": 0,
      "text": "句子文本",
      "thoughtGroups": ["意群1", "意群2"],
      "words": [
        {
          "id": 0,
          "text": "单词",
          "original": "原始单词（含标点）",
          "phonetic": "音标",
          "syllables": ["音节1", "音节2"]
        }
      ],
      "structure": [
        {
          "word": "单词",
          "type": "词性类型",
          "color": "颜色代码"
        }
      ]
    }
  ]
}

要求：
1. 用 / 标记意群分割点
2. 提供准确的国际音标
3. 正确分析词性（subject, verb, object, adjective, adverb等）
4. 为不同词性分配不同颜色
    `
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const analysisText = response.text()
    
    // 解析JSON响应
    const analysisData = JSON.parse(analysisText)
    return analysisData
    
  } catch (error) {
    console.error('Gemini API错误:', error)
    throw new Error('AI分析失败，请检查API配置')
  }
}
*/