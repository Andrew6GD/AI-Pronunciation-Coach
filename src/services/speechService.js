// 语音服务模块 - 处理TTS和语音识别

// 语音合成服务
export class TTSService {
  constructor() {
    this.synth = window.speechSynthesis
    this.voices = []
    this.currentUtterance = null
    this.accent = 'us' // 'us' for American, 'uk' for British
    
    // 等待语音加载
    this.loadVoices()
  }
  
  loadVoices() {
    return new Promise((resolve) => {
      const loadVoicesHandler = () => {
        this.voices = this.synth.getVoices()
        resolve(this.voices)
      }
      
      if (this.synth.getVoices().length > 0) {
        loadVoicesHandler()
      } else {
        this.synth.addEventListener('voiceschanged', loadVoicesHandler)
      }
    })
  }
  
  // 获取英语语音
  getEnglishVoice() {
    if (this.accent === 'uk') {
      // 英音优先级：英国口音 > 澳洲口音
      const ukVoices = this.voices.filter(voice => 
        voice.lang === 'en-GB' || 
        voice.lang === 'en-AU' ||
        voice.name.toLowerCase().includes('british') ||
        voice.name.toLowerCase().includes('uk') ||
        voice.name.toLowerCase().includes('daniel') ||
        voice.name.toLowerCase().includes('hazel')
      )
      
      if (ukVoices.length > 0) {
        return ukVoices[0]
      }
    } else {
      // 美音优先级：美国口音
      const usVoices = this.voices.filter(voice => 
        voice.lang === 'en-US' ||
        voice.name.toLowerCase().includes('american') ||
        voice.name.toLowerCase().includes('us') ||
        voice.name.toLowerCase().includes('david') ||
        voice.name.toLowerCase().includes('zira') ||
        voice.name.toLowerCase().includes('mark')
      )
      
      if (usVoices.length > 0) {
        return usVoices[0]
      }
    }
    
    // 备选方案：任何英语语音
    const englishVoices = this.voices.filter(voice => 
      voice.lang.startsWith('en-') && 
      (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.default)
    )
    
    return englishVoices[0] || this.voices.find(voice => voice.lang.startsWith('en-')) || this.voices[0]
  }
  
  // 设置口音
  setAccent(accent) {
    this.accent = accent // 'us' or 'uk'
  }
  
  // 获取当前口音
  getAccent() {
    return this.accent
  }
  
  // 获取可用的英音美音语音列表
  getAvailableAccents() {
    const usVoices = this.voices.filter(voice => 
      voice.lang === 'en-US' ||
      voice.name.toLowerCase().includes('american') ||
      voice.name.toLowerCase().includes('us')
    )
    
    const ukVoices = this.voices.filter(voice => 
      voice.lang === 'en-GB' || 
      voice.lang === 'en-AU' ||
      voice.name.toLowerCase().includes('british') ||
      voice.name.toLowerCase().includes('uk')
    )
    
    return {
      us: usVoices.length > 0,
      uk: ukVoices.length > 0
    }
  }
  
  // 播放文本
  async speak(text, options = {}) {
    const {
      rate = 1,
      pitch = 1,
      volume = 1,
      voice = null
    } = options
    
    return new Promise((resolve, reject) => {
      // 停止当前播放
      this.stop()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      utterance.pitch = pitch
      utterance.volume = volume
      utterance.voice = voice || this.getEnglishVoice()
      
      utterance.onend = () => {
        this.currentUtterance = null
        resolve()
      }
      
      utterance.onerror = (event) => {
        this.currentUtterance = null
        reject(new Error(`语音合成错误: ${event.error}`))
      }
      
      this.currentUtterance = utterance
      this.synth.speak(utterance)
    })
  }
  
  // 慢速播放
  async speakSlowly(text) {
    return this.speak(text, { rate: 0.6 })
  }
  
  // 正常速度播放
  async speakNormally(text) {
    return this.speak(text, { rate: 1 })
  }
  
  // 快速播放
  async speakFast(text) {
    return this.speak(text, { rate: 1.2 })
  }
  
  // 播放音节
  async speakSyllable(syllable) {
    return this.speak(syllable, { rate: 0.8, pitch: 1.2 })
  }
  
  // 播放单词（支持口音选择）
  async speakWord(word, accent = null) {
    const currentAccent = this.accent
    if (accent && accent !== currentAccent) {
      this.setAccent(accent)
    }
    
    try {
      await this.speak(word, { rate: 0.9, pitch: 1.1 })
    } finally {
      if (accent && accent !== currentAccent) {
        this.setAccent(currentAccent)
      }
    }
  }
  
  // 停止播放
  stop() {
    if (this.synth.speaking) {
      this.synth.cancel()
    }
    this.currentUtterance = null
  }
  
  // 暂停播放
  pause() {
    if (this.synth.speaking) {
      this.synth.pause()
    }
  }
  
  // 恢复播放
  resume() {
    if (this.synth.paused) {
      this.synth.resume()
    }
  }
  
  // 检查是否正在播放
  isSpeaking() {
    return this.synth.speaking
  }
}

// 语音识别服务
export class SpeechRecognitionService {
  constructor() {
    this.recognition = null
    this.isListening = false
    this.onResult = null
    this.onError = null
    this.onEnd = null
    this.onStart = null
    this.finalTranscript = ''
    this.interimTranscript = ''
    
    this.initRecognition()
  }
  
  initRecognition() {
    // 检查浏览器支持
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.warn('浏览器不支持语音识别')
      return
    }
    
    this.recognition = new SpeechRecognition()
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = 'en-US'
    this.recognition.maxAlternatives = 1
    
    // 事件监听
    this.recognition.onstart = () => {
      this.isListening = true
      if (this.onStart) this.onStart()
    }
    
    this.recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = this.finalTranscript
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }
      
      this.finalTranscript = finalTranscript
      this.interimTranscript = interimTranscript
      
      if (this.onResult) {
        this.onResult({
          final: finalTranscript,
          interim: interimTranscript,
          words: this.extractWords(finalTranscript + interimTranscript)
        })
      }
    }
    
    this.recognition.onerror = (event) => {
      console.error('语音识别错误:', event.error)
      this.isListening = false
      if (this.onError) this.onError(event.error)
    }
    
    this.recognition.onend = () => {
      this.isListening = false
      if (this.onEnd) this.onEnd(this.finalTranscript)
    }
  }
  
  // 提取单词
  extractWords(text) {
    return text.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0)
  }
  
  // 开始录音
  startRecording() {
    if (!this.recognition) {
      throw new Error('语音识别不可用')
    }
    
    if (this.isListening) {
      return
    }
    
    this.finalTranscript = ''
    this.interimTranscript = ''
    
    try {
      this.recognition.start()
    } catch (error) {
      console.error('启动语音识别失败:', error)
      throw error
    }
  }
  
  // 停止录音
  stopRecording() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
    }
  }
  
  // 设置事件监听器
  setEventListeners({ onResult, onError, onEnd, onStart }) {
    this.onResult = onResult
    this.onError = onError
    this.onEnd = onEnd
    this.onStart = onStart
  }
  
  // 检查是否支持语音识别
  static isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  }
}

// 语音评分服务
export class SpeechScoringService {
  // 幽默评语库
  static FUNNY_PRAISE_RULES = [
    {
      min: 90, max: 100, label: "大师级",
      messages: [
        "完美的声音！麦克风要求签名。/ Flawless! The mic wants your autograph.",
        "堪比母语，词典都点了个赞。/ Native-level— even the dictionary approves.",
        "空气都在跟读你。/ The air is shadowing you.",
        "你一开口，字幕失业了。/ With your voice, subtitles are out of work.",
        "稳定得像原声 CD。/ As steady as a studio track.",
        "牛津打电话：请你别卷了。/ Oxford called: please stop overachieving.",
        "配音演员上线！/ Voice-actor mode: ON."
      ]
    },
    {
      min: 80, max: 89, label: "优秀",
      messages: [
        "差一点点就满分，氧气都稀薄了。/ So close to perfect—air feels thinner up here.",
        "耳朵在鼓掌，舌头在表演。/ Ears applaud, tongue performs.",
        "九成功力，剩下一成是摆造型。/ 90% skill, 10% posing.",
        "比我家 Wi-Fi 还顺。/ Smoother than my Wi-Fi.",
        "音色好到可以外放。/ Good enough to play on speakers.",
        "再抛光一下直接反光。/ One polish away from reflective.",
        "台词给你，舞台自备。/ Lines are yours—bring your own stage."
      ]
    },
    {
      min: 70, max: 79, label: "良好",
      messages: [
        "节奏像地铁：基本准点。/ Like the subway: mostly on time.",
        "咬字有型，再压一压边。/ Stylish diction—tighten the edges.",
        "你的连读比键盘还快。/ Your linking beats my keyboard.",
        "再来一遍，就是解锁成就。/ One more run unlocks an achievement.",
        "声带在线，细节再上线。/ Vocal cords online; details loading.",
        "很丝滑，偶尔打个折。/ Smooth with the occasional fold.",
        "已经能当示范，差个彩排。/ Demo-worthy—just needs a rehearsal."
      ]
    },
    {
      min: 60, max: 69, label: "合格",
      messages: [
        "方向正确，偶尔拐弯；已为你重算路线。/ Right way with detours—GPS recalculating.",
        "能听懂，也能跟；嘴巴再大胆点。/ Understands and follows—give your mouth more courage.",
        "开的是手动挡，抖两下就顺了。/ Manual gear—two shakes and it's smooth.",
        "语气很好，音准再拧一拧。/ Great tone—tighten the pitch a bit.",
        "节奏抓住了，细节别放手。/ You got the beat—don't drop the details.",
        "有戏！导演让你加一条。/ The director says: one more take.",
        "合格稳稳的，再往上冲。/ Solid pass—now push upward."
      ]
    },
    {
      min: 50, max: 59, label: "起步",
      messages: [
        "再努力试试看！/ Give it another go!",
        "先把节奏拿下，语音自然跟上。/ Nail the rhythm; the sounds will follow.",
        "像咖啡第一口，醒了三分。/ First sip of coffee—30% awake.",
        "把 th 当新朋友多见几次。/ Meet 'th' like a new friend—often.",
        "慢一点，其实会更准。/ Slower = sharper.",
        "别怕停顿，喘口气更清晰。/ Pauses help clarity—breathe.",
        "今天铺路，明天飙车。/ Pave today, speed tomorrow."
      ]
    },
    {
      min: 40, max: 49, label: "加油",
      messages: [
        "现在像'英语早起'：人醒 70%，嘴醒 30%。/ Early-morning English: 70% brain, 30% mouth.",
        "把难词拆了逐个拿下。/ Break tough words into snacks.",
        "一句话两个重点：慢和准。/ Two keys: slow and accurate.",
        "别担心，AI 正在你身后举牌加油。/ Don't worry—the AI is holding a cheer sign.",
        "多读一遍，分数就会害羞上涨。/ Read again and the score blushes upward.",
        "从重音下手，气势就站起来了。/ Start with stress; confidence stands up.",
        "你已经在路上了，别急着到站。/ You're on the way—no rush to the station."
      ]
    },
    {
      min: 0, max: 39, label: "鼓励",
      messages: [
        "万事开头难，先拿下一个单词。/ Beginnings are hard—claim one word first.",
        "热热嗓子，发动机预热。/ Warm up—engine preheating.",
        "把嘴巴当鼓点，先敲节奏。/ Treat your mouth like a drum—hit the beat.",
        "今天一点点，明天一大段。/ A little today, a lot tomorrow.",
        "先和镜子练，再和世界说。/ Practice with the mirror, then the world.",
        "读慢点，分更高。/ Slower reading, higher scores.",
        "继续走，放弃不在路线里。/ Keep walking—'quit' isn't on the map."
      ]
    }
  ];

  // 随机获取一句评语
  static pickFunnyPraise(score) {
    const rule = this.FUNNY_PRAISE_RULES.find(r => score >= r.min && score <= r.max) ?? this.FUNNY_PRAISE_RULES.at(-1);
    const arr = rule.messages;
    const message = arr[Math.floor(Math.random() * arr.length)];
    
    // 分离中英文评语
    const parts = message.split(' / ');
    return {
      chinese: parts[0] || message,
      english: parts[1] || ''
    };
  }

  // 计算发音准确度
  static calculateAccuracy(originalText, recognizedText) {
    const originalWords = originalText.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0)
    
    const recognizedWords = recognizedText.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0)
    
    if (originalWords.length === 0) return 0
    
    let matchCount = 0
    const matchedWords = []
    const missedWords = []
    
    originalWords.forEach((word, index) => {
      if (recognizedWords.includes(word)) {
        matchCount++
        matchedWords.push({ word, index })
      } else {
        missedWords.push({ word, index })
      }
    })
    
    const accuracy = (matchCount / originalWords.length) * 100
    
    return {
      score: Math.round(accuracy),
      totalWords: originalWords.length,
      matchedWords: matchCount,
      matchedWordsList: matchedWords,
      missedWordsList: missedWords,
      recognizedText: recognizedText
    }
  }
  
  // 生成评分等级
  static getScoreGrade(score) {
    const rule = this.FUNNY_PRAISE_RULES.find(r => score >= r.min && score <= r.max) ?? this.FUNNY_PRAISE_RULES.at(-1);
    const messageObj = this.pickFunnyPraise(score);
    
    // 根据分数返回颜色
    let color = '#ef4444'; // 默认红色
    if (score >= 90) color = '#10b981'; // 绿色
    else if (score >= 80) color = '#059669'; // 深绿色
    else if (score >= 70) color = '#3b82f6'; // 蓝色
    else if (score >= 60) color = '#f59e0b'; // 橙色
    
    return {
      label: rule.label,
      color: color,
      message: messageObj
    }
  }
}

// 创建全局实例
export const ttsService = new TTSService()
export const speechRecognitionService = new SpeechRecognitionService()