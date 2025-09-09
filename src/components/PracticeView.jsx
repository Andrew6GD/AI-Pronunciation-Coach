import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Play, Pause, Mic, MicOff, RotateCcw, 
  ChevronLeft, ChevronRight, Eye, EyeOff, 
  Gauge, Award, Volume2, Zap
} from 'lucide-react'
import { ttsService, speechRecognitionService, SpeechScoringService } from '../services/speechService'
import azureTtsService from '../services/azureTtsService'
import ParticleEffect from './ParticleEffect'
import { VOICE_CONFIG, getVoiceId, getVoiceName, isValidVoiceCombination, DEFAULT_VOICE } from '../config/voiceConfig'
import './PracticeView.css'

const PracticeView = ({ analysisData, originalText, onBack, onReanalyze, currentAccent }) => {
  const [practiceMode, setPracticeMode] = useState('full') // 'full' | 'sentence'
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState('normal') // 'slow' | 'normal' | 'fast'
  const [showPhonetics, setShowPhonetics] = useState(false)
  const [showScore, setShowScore] = useState(true)

  const [selectedAccent, setSelectedAccent] = useState(currentAccent || 'us') // 'us' | 'uk'
  const [selectedGender, setSelectedGender] = useState('male') // 'male' | 'female'
  const [showAccentDropdown, setShowAccentDropdown] = useState(false)
  const [recognizedWords, setRecognizedWords] = useState([])
  const [scoreData, setScoreData] = useState(null)
  const [particles, setParticles] = useState([])
  const [highlightedWords, setHighlightedWords] = useState(new Set())
  const [recordedAudio, setRecordedAudio] = useState(null)
  const [isPlayingRecording, setIsPlayingRecording] = useState(false)
  const [showFallbackMessage, setShowFallbackMessage] = useState(false)
  
  const practiceRef = useRef(null)
  const particleIdRef = useRef(0)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const currentAudioRef = useRef(null)
  const scoreDisplayRef = useRef(null)

  // 初始化语音识别
  useEffect(() => {
    speechRecognitionService.setEventListeners({
      onResult: handleSpeechResult,
      onError: handleSpeechError,
      onEnd: handleSpeechEnd,
      onStart: handleSpeechStart
    })
  }, [practiceMode, currentSentenceIndex])

  // 组件卸载时清理缓存
  useEffect(() => {
    return () => {
      // 清理Azure TTS缓存
      if (azureTtsService.isAvailable()) {
        azureTtsService.clearCache()
      }
    }
  }, [])

  // 当原始文本改变时清理缓存（内容更换）
  useEffect(() => {
    if (azureTtsService.isAvailable()) {
      azureTtsService.clearCache()
      console.log('内容更换，已清理Azure TTS缓存')
    }
  }, [originalText])

  // 语音识别结果处理
  const handleSpeechResult = useCallback((result) => {
    const words = result.words
    setRecognizedWords(words)
    
    // 实时高亮匹配的单词并触发粒子效果
    if (practiceMode === 'full') {
      const allWords = analysisData.sentences.flatMap((s, sentenceIndex) => 
        s.words.map((w, wordIndex) => ({
          text: w.text.toLowerCase(),
          sentenceIndex,
          wordIndex,
          id: `${sentenceIndex}-${wordIndex}`
        }))
      )
      
      words.forEach(word => {
        // 找到第一个未被高亮的匹配单词
        const matchingWord = allWords.find(w => 
          w.text === word.toLowerCase() && !highlightedWords.has(w.id)
        )
        
        if (matchingWord) {
          setHighlightedWords(prev => new Set([...prev, matchingWord.id]))
          triggerParticleEffect(matchingWord.id)
        }
      })
    } else {
      const currentSentence = analysisData.sentences[currentSentenceIndex]
      const sentenceWords = currentSentence.words.map((w, wordIndex) => ({
        text: w.text.toLowerCase(),
        wordIndex,
        id: `${currentSentenceIndex}-${wordIndex}`
      }))
      
      words.forEach(word => {
        // 找到第一个未被高亮的匹配单词
        const matchingWord = sentenceWords.find(w => 
          w.text === word.toLowerCase() && !highlightedWords.has(w.id)
        )
        
        if (matchingWord) {
          setHighlightedWords(prev => new Set([...prev, matchingWord.id]))
          triggerParticleEffect(matchingWord.id)
        }
      })
    }
  }, [practiceMode, currentSentenceIndex, analysisData, highlightedWords])

  const handleSpeechError = useCallback((error) => {
    console.error('语音识别错误:', error)
    setIsRecording(false)
  }, [])

  const handleSpeechEnd = useCallback((finalTranscript) => {
    setIsRecording(false)
    
    // 计算评分
    const targetText = practiceMode === 'full' 
      ? originalText 
      : analysisData.sentences[currentSentenceIndex].text
    
    const score = SpeechScoringService.calculateAccuracy(targetText, finalTranscript)
    setScoreData(score)
    
    // 自动滚动到评分模块
    setTimeout(() => {
      if (scoreDisplayRef.current) {
        scoreDisplayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
    
    // 重置高亮
    setTimeout(() => {
      setHighlightedWords(new Set())
    }, 2000)
  }, [practiceMode, currentSentenceIndex, originalText, analysisData])

  const handleSpeechStart = useCallback(() => {
    setRecognizedWords([])
    setHighlightedWords(new Set())
    setScoreData(null)
  }, [])

  // 触发粒子效果
  const triggerParticleEffect = useCallback((wordId) => {
    const wordElement = document.querySelector(`[data-word-id="${wordId}"]`)
    if (wordElement) {
      const rect = wordElement.getBoundingClientRect()
      const containerRect = practiceRef.current?.getBoundingClientRect()
      
      if (containerRect) {
        const newParticles = Array.from({ length: 3 }, () => ({
          id: particleIdRef.current++,
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top - 10, // 稍微向上偏移
          color: `hsl(200, 60%, 75%)`, // 浅蓝色
          size: Math.random() * 8 + 4 // 4-12像素随机大小
        }))
        
        setParticles(prev => [...prev, ...newParticles])
        
        // 清理粒子
        setTimeout(() => {
          setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)))
        }, 1200)
      }
    }
  }, [])

  // 播放音频
  const handlePlay = async () => {
    if (isPlaying) {
      // 停止Azure TTS或Web Speech API
      if (azureTtsService.isAvailable()) {
        azureTtsService.stop()
      } else {
        ttsService.stop()
      }
      setIsPlaying(false)
      return
    }

    // 如果正在录音，先停止录音（但不触发评分）
    if (isRecording) {
      // 临时移除onEnd监听器，避免触发评分
      const originalOnEnd = speechRecognitionService.onEnd
      speechRecognitionService.onEnd = null
      
      speechRecognitionService.stopRecording()
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      setIsRecording(false)
      
      // 恢复onEnd监听器
      setTimeout(() => {
        speechRecognitionService.onEnd = originalOnEnd
      }, 100)
    }

    // 如果正在播放录音，先停止录音回放
    if (isPlayingRecording && currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current.currentTime = 0
      currentAudioRef.current = null
      setIsPlayingRecording(false)
    }

    const textToSpeak = practiceMode === 'full' 
      ? originalText 
      : analysisData.sentences[currentSentenceIndex].text

    setIsPlaying(true)
    
    try {
      // 优先使用Azure TTS，Web Speech API作为兜底
      if (azureTtsService.isAvailable()) {
        // 根据播放速度调整语速
        let rate = 1.0
        switch (playbackSpeed) {
          case 'slow':
            rate = 0.7
            break
          case 'fast':
            rate = 1.3
            break
          default:
            rate = 1.0
        }
        
        await azureTtsService.playAudio(textToSpeak, selectedAccent, selectedGender, rate)
      } else {
        // 兜底使用Web Speech API
        console.warn('Azure TTS不可用，使用Web Speech API兜底')
        setShowFallbackMessage(true)
        setTimeout(() => setShowFallbackMessage(false), 3000)
        const webSpeechAccent = selectedAccent === 'gb' ? 'uk' : selectedAccent
        ttsService.setAccent(webSpeechAccent)
        switch (playbackSpeed) {
          case 'slow':
            await ttsService.speakSlowly(textToSpeak)
            break
          case 'fast':
            await ttsService.speakFast(textToSpeak)
            break
          default:
            await ttsService.speakNormally(textToSpeak)
        }
      }
    } catch (error) {
      console.error('播放失败:', error)
      // 如果Azure TTS失败，尝试使用Web Speech API兜底
      if (azureTtsService.isAvailable()) {
        console.warn('Azure TTS播放失败，尝试使用Web Speech API兜底')
        setShowFallbackMessage(true)
        setTimeout(() => setShowFallbackMessage(false), 3000)
        try {
          const webSpeechAccent = selectedAccent === 'gb' ? 'uk' : selectedAccent
          ttsService.setAccent(webSpeechAccent)
          switch (playbackSpeed) {
            case 'slow':
              await ttsService.speakSlowly(textToSpeak)
              break
            case 'fast':
              await ttsService.speakFast(textToSpeak)
              break
            default:
              await ttsService.speakNormally(textToSpeak)
          }
        } catch (fallbackError) {
          console.error('Web Speech API兜底也失败:', fallbackError)
        }
      }
    } finally {
      setIsPlaying(false)
    }
  }

  // 录音控制
  const handleRecord = async () => {
    if (isRecording) {
      speechRecognitionService.stopRecording()
      // 停止媒体录音
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      // 停止正在播放的录音
      if (isPlayingRecording && currentAudioRef.current) {
        currentAudioRef.current.pause()
        currentAudioRef.current.currentTime = 0
        currentAudioRef.current = null
        setIsPlayingRecording(false)
      }
    } else {
      try {
        // 如果正在播放音频，先停止播放
        if (isPlaying) {
          if (azureTtsService.isAvailable()) {
            azureTtsService.stop()
          } else {
            ttsService.stop()
          }
          setIsPlaying(false)
        }
        
        // 如果正在播放录音，先停止播放并清空录音文件
        if (isPlayingRecording && currentAudioRef.current) {
          currentAudioRef.current.pause()
          currentAudioRef.current.currentTime = 0
          currentAudioRef.current = null
          setIsPlayingRecording(false)
        }
        
        // 清空之前的录音文件
        if (recordedAudio) {
          URL.revokeObjectURL(recordedAudio)
          setRecordedAudio(null)
        }
        
        speechRecognitionService.startRecording()
        setIsRecording(true)
        
        // 开始媒体录音用于回放
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaRecorderRef.current = new MediaRecorder(stream)
        audioChunksRef.current = []
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data)
        }
        
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
          const audioUrl = URL.createObjectURL(audioBlob)
          setRecordedAudio(audioUrl)
          
          // 停止所有音频轨道
          stream.getTracks().forEach(track => track.stop())
        }
        
        mediaRecorderRef.current.start()
      } catch (error) {
        console.error('录音失败:', error)
        alert('录音功能不可用，请检查麦克风权限')
      }
    }
  }



  // 切换语音
  const handleVoiceChange = async (voiceKey) => {
    // 从voiceKey解析accent和gender (格式: "us-male", "gb-female"等)
    const [accent, gender] = voiceKey.split('-')
    
    // 验证声音组合是否在白名单中
    if (isValidVoiceCombination(accent, gender)) {
      const voice = { accent, gender }
      setSelectedAccent(voice.accent)
      setSelectedGender(voice.gender)
      
      // 如果正在播放，停止当前播放
      if (isPlaying) {
        // 停止Azure TTS或Web Speech API
        if (azureTtsService.isAvailable()) {
          azureTtsService.stop()
        } else {
          ttsService.stop()
        }
        setIsPlaying(false)
      }
      
      // 只有在使用Web Speech API时才需要设置口音 (gb -> uk for Web Speech API)
      if (!azureTtsService.isAvailable()) {
        const webSpeechAccent = voice.accent === 'gb' ? 'uk' : voice.accent
        ttsService.setAccent(webSpeechAccent)
      }
      
      // 重新分析文本以获取对应口音的音标
      if (onReanalyze) {
        await onReanalyze(voice.accent)
      }
      
      setShowAccentDropdown(false)
    }
  }
  
  // 获取当前语音配置的显示文本
  const getVoiceDisplayText = () => {
    const accentText = selectedAccent === 'us' ? 'US' : 'GB'
    const genderText = selectedGender === 'male' ? 'Male' : 'Female'
    return `${accentText}-${genderText}`
  }

  // 切换句子
  const goToPreviousSentence = () => {
    setCurrentSentenceIndex(prev => Math.max(0, prev - 1))
    setScoreData(null)
  }

  const goToNextSentence = () => {
    setCurrentSentenceIndex(prev => Math.min(analysisData.sentences.length - 1, prev + 1))
    setScoreData(null)
  }

  // 音标点击播放
  const handlePhoneticClick = async (word) => {
    try {
      // 优先使用Azure TTS，Web Speech API作为兜底
       if (azureTtsService.isAvailable()) {
         await azureTtsService.playAudio(word, selectedAccent, selectedGender, 1.0)
      } else {
        // 兜底使用Web Speech API
        await ttsService.speakWord(word, selectedAccent)
      }
    } catch (error) {
      console.error('播放单词失败:', error)
      // 如果Azure TTS失败，尝试使用Web Speech API兜底
      if (azureTtsService.isAvailable()) {
        try {
          await ttsService.speakWord(word, selectedAccent)
        } catch (fallbackError) {
          console.error('Web Speech API兜底也失败:', fallbackError)
        }
      }
    }
  }
  
  // 播放录音回放
  const handlePlayRecording = () => {
    if (!recordedAudio) return
    
    if (isPlayingRecording) {
      // 停止播放
      if (currentAudioRef.current) {
        currentAudioRef.current.pause()
        currentAudioRef.current.currentTime = 0
        currentAudioRef.current = null
      }
      setIsPlayingRecording(false)
    } else {
      // 如果正在播放TTS音频，先停止
      if (isPlaying) {
        if (azureTtsService.isAvailable()) {
          azureTtsService.stop()
        } else {
          ttsService.stop()
        }
        setIsPlaying(false)
      }
      
      // 开始播放
      const audio = new Audio(recordedAudio)
      currentAudioRef.current = audio
      audio.onended = () => {
        setIsPlayingRecording(false)
        currentAudioRef.current = null
      }
      audio.play()
      setIsPlayingRecording(true)
    }
  }
  
  // 重置练习
  const handleReset = () => {
    setRecognizedWords([])
    setHighlightedWords(new Set())
    setScoreData(null)
    setParticles([])
    setRecordedAudio(null)
    setIsPlayingRecording(false)
    if (isRecording) {
      speechRecognitionService.stopRecording()
      setIsRecording(false)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
    }
    if (isPlaying) {
      if (azureTtsService.isAvailable()) {
        azureTtsService.stop()
      } else {
        ttsService.stop()
      }
      setIsPlaying(false)
    }
  }

  const currentSentence = practiceMode === 'sentence' ? analysisData.sentences[currentSentenceIndex] : null
  const displaySentences = practiceMode === 'full' ? analysisData.sentences : [currentSentence]

  return (
    <div className="practice-view">
      {/* 顶部控制栏 */}
      <motion.div 
        className="practice-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button className="back-button btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>返回</span>
        </button>
        
        <div className="mode-toggle">
          <button 
            className={`mode-btn ${practiceMode === 'full' ? 'active' : ''}`}
            onClick={() => setPracticeMode('full')}
          >
            全篇练习
          </button>
          <button 
            className={`mode-btn ${practiceMode === 'sentence' ? 'active' : ''}`}
            onClick={() => setPracticeMode('sentence')}
          >
            逐句练习
          </button>
        </div>
        
        <div className="display-toggles">
          <button 
            className={`toggle-btn ${showPhonetics ? 'active' : ''}`}
            onClick={() => setShowPhonetics(!showPhonetics)}
            title="显示/隐藏音标"
          >
            {showPhonetics ? <Eye size={16} /> : <EyeOff size={16} />}
            <span>音标</span>
          </button>
          
          <button 
            className={`toggle-btn ${showScore ? 'active' : ''}`}
            onClick={() => setShowScore(!showScore)}
            title="显示/隐藏评分"
          >
            {showScore ? <Gauge size={16} /> : <EyeOff size={16} />}
            <span>评分</span>
          </button>

        </div>
        
        {/* 语音选择 */}
        <div className="voice-selection">
          <span className="voice-label">语音:</span>
          
          {/* Azure TTS兜底提示 */}
          {showFallbackMessage && (
            <div className="fallback-message">
              AI TTS繁忙，已帮您自动切换可使用语音
            </div>
          )}
          
          {/* 口音选择下拉菜单 */}
          <div className="dropdown-container">
            <button 
              className="dropdown-btn accent-dropdown"
              onClick={() => {
                setShowAccentDropdown(!showAccentDropdown)
              }}
              title="选择口音"
            >
              {selectedAccent === 'us' ? 'US' : 'UK'}-{selectedGender === 'male' ? 'Male' : 'Female'}
              <span className="dropdown-arrow">▼</span>
            </button>
            
            {showAccentDropdown && (
              <div className="dropdown-menu accent-menu">
                {Object.entries(VOICE_CONFIG).map(([accentKey, accentConfig]) => 
                  Object.entries(accentConfig.voices).map(([genderKey, voiceInfo]) => {
                    const voiceKey = `${accentKey}-${genderKey}`
                    const isActive = selectedAccent === accentKey && selectedGender === genderKey
                    const displayLabel = accentKey.toUpperCase() === 'GB' ? 'UK' : accentKey.toUpperCase()
                    
                    return (
                      <button 
                        key={voiceKey}
                        className={`dropdown-item ${isActive ? 'active' : ''}`}
                        onClick={() => handleVoiceChange(voiceKey)}
                        title={voiceInfo.description}
                      >
                        {displayLabel}-{genderKey === 'male' ? 'Male' : 'Female'}
                      </button>
                    )
                  })
                )}
              </div>
            )}
          </div>
          

          

        </div>
      </motion.div>

      {/* 主练习区域 */}
      <motion.div 
        className="practice-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="practice-main" ref={practiceRef}>
          {/* 句子导航 (逐句模式) */}
          {practiceMode === 'sentence' && (
            <div className="sentence-navigation">
              <button 
                className="nav-btn"
                onClick={goToPreviousSentence}
                disabled={currentSentenceIndex === 0}
              >
                <ChevronLeft size={20} />
              </button>
              <span className="sentence-counter">
                {currentSentenceIndex + 1} / {analysisData.sentences.length}
              </span>
              <button 
                className="nav-btn"
                onClick={goToNextSentence}
                disabled={currentSentenceIndex === analysisData.sentences.length - 1}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* 文本显示区域 */}
          <div className="text-display">
            {displaySentences.map((sentence, sentenceIndex) => (
              <div key={sentence.id} className="sentence-container">
                {/* 句子文本 */}
                <div className="sentence-text">
                  <div className="words-container">
                    {sentence.words.map((word, wordIndex) => {
                      const wordId = practiceMode === 'full' ? `${sentenceIndex}-${wordIndex}` : `${currentSentenceIndex}-${wordIndex}`
                      return (
                        <div key={wordIndex} className="word-with-phonetic">
                          <motion.span
                            className={`inline-word ${
                              highlightedWords.has(wordId) ? 'highlighted' : ''
                            } ${
                              scoreData?.missedWordsList.some(missed => missed.word === word.text.toLowerCase()) ? 'missed' : ''
                            }`}
                            data-word={word.text.toLowerCase()}
                            data-word-id={wordId}
                            whileHover={{ scale: 1.05 }}
                            animate={highlightedWords.has(wordId) ? {
                              scale: [1, 1.1, 1],
                              transition: { duration: 0.3 }
                            } : {}}
                            title={showPhonetics ? word.phonetic : word.original}
                          >
                            {word.original}
                          </motion.span>
                          {showPhonetics && (
                            <div 
                              className="word-phonetic-below clickable"
                              onClick={() => handlePhoneticClick(word.text)}
                              title={`点击播放 ${word.text} 的${selectedAccent === 'us' ? '美式' : '英式'}发音`}
                            >
                              {word.phonetic}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
                

              </div>
            ))}
          </div>

          {/* 粒子效果 */}
          <ParticleEffect particles={particles} />
        </div>

        {/* 控制面板 */}
        <div className="control-panel">
          {/* 播放控制 */}
          <div className="playback-controls">
            <div className="speed-controls">
              <button 
                className={`speed-btn ${playbackSpeed === 'slow' ? 'active' : ''}`}
                onClick={() => setPlaybackSpeed('slow')}
              >
                慢速
              </button>
              <button 
                className={`speed-btn ${playbackSpeed === 'normal' ? 'active' : ''}`}
                onClick={() => setPlaybackSpeed('normal')}
              >
                正常
              </button>
              <button 
                className={`speed-btn ${playbackSpeed === 'fast' ? 'active' : ''}`}
                onClick={() => setPlaybackSpeed('fast')}
              >
                快速
              </button>
            </div>
            
            <button 
              className={`play-btn btn ${isPlaying ? 'btn-error' : 'btn-primary'}`}
              onClick={handlePlay}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              <span>{isPlaying ? '停止' : '播放'}</span>
            </button>
          </div>

          {/* 录音控制 */}
          <div className="recording-controls">
            <button 
              className={`record-btn btn ${isRecording ? 'btn-error recording' : 'btn-success'}`}
              onClick={handleRecord}
              disabled={!speechRecognitionService.recognition}
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              <span>{isRecording ? '停止录音' : '开始录音'}</span>
            </button>
            
            {recordedAudio && (
              <button 
                className={`playback-btn btn ${isPlayingRecording ? 'btn-error' : 'btn-info'}`}
                onClick={handlePlayRecording}
              >
                {isPlayingRecording ? <Pause size={20} /> : <Volume2 size={20} />}
                <span>{isPlayingRecording ? '停止回放' : '听录音'}</span>
              </button>
            )}
            
            <button 
              className="reset-btn btn btn-secondary"
              onClick={handleReset}
            >
              <RotateCcw size={20} />
              <span>重置</span>
            </button>
          </div>
        </div>

        {/* 评分显示 */}
        <AnimatePresence>
          {scoreData && showScore && (
            <motion.div 
              ref={scoreDisplayRef}
              className="score-display"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="score-header">
                <div className="score-icon">
                  <Gauge size={24} />
                </div>
                <h3>发音评分</h3>
              </div>
              
              <div className="score-content">
                <div className="score-main">
                  <div 
                    className="score-circle"
                    style={{ '--score': scoreData.score }}
                  >
                    <span className="score-number">{scoreData.score}</span>
                    <span className="score-label">分</span>
                  </div>
                  
                  <div className="score-grade">
                    <div className="grade-message-chinese">
                      {SpeechScoringService.getScoreGrade(scoreData.score).message.chinese}
                    </div>
                    {SpeechScoringService.getScoreGrade(scoreData.score).message.english && (
                      <div className="grade-message-english">
                        {SpeechScoringService.getScoreGrade(scoreData.score).message.english}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="score-details">
                  <div className="score-stat">
                    <span className="stat-label">总词数:</span>
                    <span className="stat-value">{scoreData.totalWords}</span>
                  </div>
                  <div className="score-stat">
                    <span className="stat-label">正确:</span>
                    <span className="stat-value correct">{scoreData.matchedWords}</span>
                  </div>
                  <div className="score-stat">
                    <span className="stat-label">错误:</span>
                    <span className="stat-value incorrect">{scoreData.missedWordsList.length}</span>
                  </div>
                </div>
                
                {scoreData.recognizedText && (
                  <div className="recognized-text">
                    <h4>识别结果:</h4>
                    <p>"{scoreData.recognizedText}"</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>


      </motion.div>
    </div>
  )
}

export default PracticeView