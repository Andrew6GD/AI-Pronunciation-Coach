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
    if (score >= 90) return { grade: 'A+', color: '#10b981', message: '完美！' }
    if (score >= 80) return { grade: 'A', color: '#059669', message: '优秀！' }
    if (score >= 70) return { grade: 'B', color: '#3b82f6', message: '良好！' }
    if (score >= 60) return { grade: 'C', color: '#f59e0b', message: '还不错！' }
    return { grade: 'D', color: '#ef4444', message: '继续努力！' }
  }
}

// 创建全局实例
export const ttsService = new TTSService()
export const speechRecognitionService = new SpeechRecognitionService()