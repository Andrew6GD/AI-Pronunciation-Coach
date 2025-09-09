import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import InputView from './components/InputView'
import PracticeView from './components/PracticeView'
import FloatingActions from './components/FloatingActions'
import LoadingSpinner from './components/LoadingSpinner'
// import ESpeakTest from './components/ESpeakTest' // 已移除测试组件
import { analyzeText } from './services/aiService'
import './App.css'

function App() {
  const [inputText, setInputText] = useState('')
  const [analysisData, setAnalysisData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentAccent, setCurrentAccent] = useState('us')

  // 处理文本分析
  const handleAnalyze = useCallback(async (text, accent = currentAccent) => {
    if (!text.trim()) {
      setError('请输入要练习的英文文本')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const result = await analyzeText(text, accent)
      setAnalysisData(result)
      setInputText(text)
      setCurrentAccent(accent)
    } catch (err) {
      console.error('分析失败:', err)
      setError('文本分析失败，请检查网络连接或稍后重试')
    } finally {
      setIsLoading(false)
    }
  }, [currentAccent])

  // 重新分析文本（用于口音切换）
  const handleReanalyze = useCallback(async (accent) => {
    if (inputText) {
      await handleAnalyze(inputText, accent)
    }
  }, [inputText, handleAnalyze])
  
  // 清除练习数据
  const handleBackToInput = useCallback(() => {
    setAnalysisData(null)
    setError(null)
  }, [])

  // 清除错误
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return (
    <div className="app">
      <FloatingActions />
      {analysisData && <Header isDetailPage={true} />}
      
      <main className="main-content">
        <AnimatePresence mode="wait">
          {!analysisData ? (
            /* 输入页面 */
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <InputView 
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
                error={error}
                onClearError={clearError}
              />
            </motion.div>
          ) : (
            /* 练习页面 */
            <motion.div
              key="practice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PracticeView 
                analysisData={analysisData}
                originalText={inputText}
                onBack={handleBackToInput}
                onReanalyze={handleReanalyze}
                currentAccent={currentAccent}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {isLoading && <LoadingSpinner />}
      </main>
    </div>
  )
}

export default App