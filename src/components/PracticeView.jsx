import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Play, Pause, Mic, MicOff, RotateCcw, 
  ChevronLeft, ChevronRight, Eye, EyeOff, 
  Gauge, Award, Volume2, Zap
} from 'lucide-react'
import { ttsService, speechRecognitionService, SpeechScoringService } from '../services/speechService'
import ParticleEffect from './ParticleEffect'
import './PracticeView.css'

const PracticeView = ({ analysisData, originalText, onBack, onReanalyze, currentAccent }) => {
  const [practiceMode, setPracticeMode] = useState('full') // 'full' | 'sentence'
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState('normal') // 'slow' | 'normal' | 'fast'
  const [showPhonetics, setShowPhonetics] = useState(false)
  const [showStructure, setShowStructure] = useState(false)
  const [showThoughtGroups, setShowThoughtGroups] = useState(false)
  const [showThoughtGroupsHint, setShowThoughtGroupsHint] = useState(false)
  const [expandedStructure, setExpandedStructure] = useState({})
  const [selectedAccent, setSelectedAccent] = useState(currentAccent || 'us') // 'us' | 'uk'
  const [recognizedWords, setRecognizedWords] = useState([])
  const [scoreData, setScoreData] = useState(null)
  const [particles, setParticles] = useState([])
  const [highlightedWords, setHighlightedWords] = useState(new Set())
  const [recordedAudio, setRecordedAudio] = useState(null)
  const [isPlayingRecording, setIsPlayingRecording] = useState(false)
  
  const practiceRef = useRef(null)
  const particleIdRef = useRef(0)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const currentAudioRef = useRef(null)

  // 初始化语音识别
  useEffect(() => {
    speechRecognitionService.setEventListeners({
      onResult: handleSpeechResult,
      onError: handleSpeechError,
      onEnd: handleSpeechEnd,
      onStart: handleSpeechStart
    })
  }, [practiceMode, currentSentenceIndex])

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
      ttsService.stop()
      setIsPlaying(false)
      return
    }

    // 如果正在录音，先停止录音
    if (isRecording) {
      speechRecognitionService.stopRecording()
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      setIsRecording(false)
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
    } catch (error) {
      console.error('播放失败:', error)
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
          ttsService.stop()
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



  // 切换口音
  const handleAccentChange = async (newAccent) => {
    setSelectedAccent(newAccent)
    ttsService.setAccent(newAccent)
    
    // 如果正在播放，停止当前播放
    if (isPlaying) {
      ttsService.stop()
      setIsPlaying(false)
    }
    
    // 重新分析文本以获取对应口音的音标
    if (onReanalyze) {
      await onReanalyze(newAccent)
    }
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
      await ttsService.speakWord(word, selectedAccent)
    } catch (error) {
      console.error('播放单词失败:', error)
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
        ttsService.stop()
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
      ttsService.stop()
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
            className={`toggle-btn ${showStructure ? 'active' : ''}`}
            onClick={() => setShowStructure(!showStructure)}
            title="显示/隐藏句子结构"
          >
            {showStructure ? <Eye size={16} /> : <EyeOff size={16} />}
            <span>结构</span>
          </button>
          <div className="thought-groups-button-container">
            <button 
              className={`toggle-btn ${showThoughtGroups ? 'active' : ''}`}
              onClick={() => {
                setShowThoughtGroups(!showThoughtGroups)
                setShowThoughtGroupsHint(false)
              }}
              onMouseEnter={() => setShowThoughtGroupsHint(true)}
              onMouseLeave={() => setShowThoughtGroupsHint(false)}
              title="显示/隐藏意群标记"
            >
              {showThoughtGroups ? <Eye size={16} /> : <EyeOff size={16} />}
              <span>意群</span>
            </button>
            {/* 意群提示（显示在按钮正下方） */}
            {showThoughtGroupsHint && (
              <div className="thought-groups-hint">
                <span className="hint-text">💡 斜杠 / 表示自然停顿点，帮助掌握朗读节奏</span>
              </div>
            )}
          </div>
        </div>
        
        {/* 口音切换 */}
        <div className="accent-toggles">
          <span className="accent-label">口音:</span>
          <button 
            className={`accent-btn ${selectedAccent === 'us' ? 'active' : ''}`}
            onClick={() => handleAccentChange('us')}
            title="美式发音"
          >
            🇺🇸 美音
          </button>
          <button 
            className={`accent-btn ${selectedAccent === 'uk' ? 'active' : ''}`}
            onClick={() => handleAccentChange('uk')}
            title="英式发音"
          >
            🇬🇧 英音
          </button>
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
                {/* 句子文本，融合意群斜杠和音标 */}
                <div className="sentence-text-with-groups">
                  {showThoughtGroups ? (
                    // 显示带意群斜杠的句子
                    sentence.thoughtGroupsWithSlashes.split(' / ').map((group, groupIndex, groups) => (
                      <span key={groupIndex} className="thought-group-container">
                        {group.split(' ').map((word, wordIndex) => {
                          const wordData = sentence.words.find(w => w.original.toLowerCase() === word.toLowerCase())
                          const originalWordIndex = sentence.words.findIndex(w => w.original.toLowerCase() === word.toLowerCase())
                          const wordId = practiceMode === 'full' ? `${sentenceIndex}-${originalWordIndex}` : `${currentSentenceIndex}-${originalWordIndex}`
                          return wordData ? (
                            <div key={`${groupIndex}-${wordIndex}`} className="word-with-phonetic">
                              <motion.span
                                className={`inline-word ${
                                  highlightedWords.has(wordId) ? 'highlighted' : ''
                                } ${
                                  scoreData?.missedWordsList.some(missed => missed.word === wordData.text.toLowerCase()) ? 'missed' : ''
                                }`}
                                data-word={wordData.text.toLowerCase()}
                                data-word-id={wordId}
                                whileHover={{ scale: 1.05 }}
                                animate={highlightedWords.has(wordId) ? {
                                  scale: [1, 1.1, 1],
                                  transition: { duration: 0.3 }
                                } : {}}
                                title={showPhonetics ? wordData.phonetic : wordData.original}
                              >
                                {wordData.original}
                              </motion.span>
                              {showPhonetics && (
                                <div 
                                  className="word-phonetic-below clickable"
                                  onClick={() => handlePhoneticClick(wordData.text)}
                                  title={`点击播放 ${wordData.text} 的${selectedAccent === 'us' ? '美式' : '英式'}发音`}
                                >
                                  {wordData.phonetic}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div key={`${groupIndex}-${wordIndex}`} className="word-with-phonetic">
                              <span>{word}</span>
                              {showPhonetics && <div className="word-phonetic-below"></div>}
                            </div>
                          )
                        })}
                        {groupIndex < groups.length - 1 && (
                          <span className="slash-marker"> / </span>
                        )}
                      </span>
                    ))
                  ) : (
                    // 显示普通句子
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
                  )}
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
          {scoreData && (
            <motion.div 
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
                    <Award 
                      size={20} 
                      style={{ color: SpeechScoringService.getScoreGrade(scoreData.score).color }}
                    />
                    <span 
                      style={{ color: SpeechScoringService.getScoreGrade(scoreData.score).color }}
                    >
                      {SpeechScoringService.getScoreGrade(scoreData.score).grade}
                    </span>
                    <span className="grade-message">
                      {SpeechScoringService.getScoreGrade(scoreData.score).message}
                    </span>
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

        {/* 句子结构显示 */}
        {showStructure && (
          <motion.div 
            className="structure-display"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3>句子结构分析</h3>
            <div className="structure-blocks">
              {practiceMode === 'full' ? (
                // 全篇模式：显示所有句子的结构分析
                analysisData.sentences.map((sentence, sentenceIndex) => (
                  <div key={sentence.id} className="sentence-structure">
                    <div className="grammar-analysis">
                      <div className="grammar-brief">
                        {sentence.grammarAnalysis.brief}
                      </div>
                      {expandedStructure[sentenceIndex] && (
                        <div className="grammar-detailed">
                          {sentence.grammarAnalysis.detailed.split('\n').map((line, lineIndex) => (
                            <div key={lineIndex} className="grammar-line">
                              {line}
                            </div>
                          ))}
                        </div>
                      )}
                      <button 
                        className="expand-toggle"
                        onClick={() => setExpandedStructure(prev => ({
                          ...prev,
                          [sentenceIndex]: !prev[sentenceIndex]
                        }))}
                      >
                        {expandedStructure[sentenceIndex] ? '▲ 收起' : '▼ 展开详细分析'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                // 逐句模式：只显示当前句子的结构分析
                <div className="sentence-structure">
                  <div className="grammar-analysis">
                    <div className="grammar-brief">
                      {currentSentence.grammarAnalysis.brief}
                    </div>
                    {expandedStructure[currentSentenceIndex] && (
                      <div className="grammar-detailed">
                        {currentSentence.grammarAnalysis.detailed.split('\n').map((line, lineIndex) => (
                          <div key={lineIndex} className="grammar-line">
                            {line}
                          </div>
                        ))}
                      </div>
                    )}
                    <button 
                      className="expand-toggle"
                      onClick={() => setExpandedStructure(prev => ({
                        ...prev,
                        [currentSentenceIndex]: !prev[currentSentenceIndex]
                      }))}
                    >
                      {expandedStructure[currentSentenceIndex] ? '▲ 收起' : '▼ 展开详细分析'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default PracticeView