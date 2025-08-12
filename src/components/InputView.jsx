import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { FileText, Sparkles, AlertCircle, X, Zap } from 'lucide-react'
import BrainLogo from './BrainLogo'
import './InputView.css'

const InputView = ({ onAnalyze, isLoading, error, onClearError }) => {
  const [text, setText] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (text.trim() && !isLoading) {
      onAnalyze(text.trim())
    }
  }

  const handleTextChange = (e) => {
    setText(e.target.value)
    if (error) {
      onClearError()
    }
  }

  const handleClearText = () => {
    setText('')
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const sampleTextsByLevel = {
    elementary: [
      "Hello, my name is Tom. I like apples and bananas. The cat is sleeping on the chair.",
      "I have a dog. His name is Max. He likes to play in the park every day.",
      "My family has four people. We live in a big house with a beautiful garden.",
      "Today is sunny. I want to go to the beach and swim in the blue water.",
      "I love reading books. My favorite book is about a brave little mouse.",
      "We eat breakfast at seven o'clock. I like eggs, bread and orange juice."
    ],
    middle: [
      "Last weekend, I went to the library with my friends. We studied together and helped each other with homework. Reading books is very important for our future.",
      "Technology has changed our daily lives significantly. We use smartphones, computers and the internet for communication and learning.",
      "Sports are essential for maintaining good health. Regular exercise helps us stay strong and reduces the risk of many diseases.",
      "Traveling to different countries allows us to experience diverse cultures and learn about various traditions around the world.",
      "Environmental awareness is growing among young people. Many students participate in recycling programs and clean-up activities in their communities.",
      "Learning a foreign language opens many opportunities. It helps us communicate with people from different backgrounds and understand their perspectives."
    ],
    gaokao: [
      "Environmental protection has become a global concern. We should reduce pollution, save energy, and protect wildlife to create a sustainable future for the next generation.",
      "Artificial intelligence is revolutionizing various industries, from healthcare to transportation, creating both opportunities and challenges for society.",
      "Cultural exchange programs promote mutual understanding between nations and help break down barriers that divide different communities.",
      "The rapid development of renewable energy technologies offers hope for addressing climate change and reducing our dependence on fossil fuels.",
      "Social media platforms have transformed the way we communicate, share information, and form relationships in the digital age.",
      "Scientific research and innovation play crucial roles in solving complex global problems and improving the quality of human life."
    ],
    cet: [
      "Education is the most powerful weapon which you can use to change the world. Knowledge is power and learning never stops.",
      "Globalization has created unprecedented opportunities for international cooperation, but it has also intensified competition among nations.",
      "The digital revolution has fundamentally altered business models, forcing companies to adapt their strategies to remain competitive in the market.",
      "Sustainable development requires balancing economic growth with environmental protection and social equity to ensure a better future for all.",
      "Cross-cultural communication skills are increasingly important in today's interconnected world, where people from diverse backgrounds work together.",
      "Innovation and entrepreneurship drive economic progress, creating new industries and employment opportunities while disrupting traditional sectors."
    ],
    ielts: [
      "The graph shows a significant increase in renewable energy consumption over the past decade, particularly in solar and wind power sectors.",
      "Urban planning strategies must address the challenges of population growth, infrastructure development, and environmental sustainability in modern cities.",
      "The relationship between economic development and environmental degradation presents a complex dilemma that requires innovative solutions and international cooperation.",
      "Educational institutions are increasingly adopting technology-enhanced learning approaches to improve student engagement and academic outcomes.",
      "Healthcare systems worldwide face mounting pressure to provide quality care while managing rising costs and addressing demographic changes.",
      "The phenomenon of brain drain affects developing countries as skilled professionals migrate to developed nations seeking better opportunities."
    ],
    toefl: [
      "The lecture will focus on the impact of climate change on marine ecosystems, examining how rising temperatures affect coral reef biodiversity.",
      "Archaeological evidence suggests that ancient civilizations developed sophisticated agricultural techniques that enabled them to sustain large populations.",
      "The interdisciplinary approach to scientific research has led to breakthrough discoveries that bridge traditional academic boundaries and create new fields of study.",
      "Psychological studies indicate that cognitive biases significantly influence decision-making processes, affecting both individual choices and collective behavior.",
      "The evolution of democratic institutions reflects the ongoing struggle between competing political ideologies and the need for effective governance.",
      "Biotechnology advances have opened new possibilities for treating genetic disorders, but they also raise ethical questions about human enhancement."
    ]
  };

  const getRandomSampleText = (level) => {
    const texts = sampleTextsByLevel[level];
    const randomIndex = Math.floor(Math.random() * texts.length);
    return texts[randomIndex];
  };

  const handleSampleClick = (level) => {
    const sampleText = getRandomSampleText(level);
    setText(sampleText)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  };

  return (
    <div className="input-view">
      <motion.div 
        className="input-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* 整合的宣传语 */}
        <div className="input-header">
          <motion.div 
            className="integrated-logo"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="logo-icons">
              <BrainLogo className="brain-icon" size={96} />
            </div>
            <div className="logo-content">
              <h1>AI Pronunciation Coach <span className="version-badge">Beta</span></h1>
              <p>输入任何英文段落，AI将为您智能分析并带读</p>
            </div>
          </motion.div>
        </div>

        {/* 错误提示 */}
        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <AlertCircle className="error-icon" />
            <span>{error}</span>
            <button 
              className="error-close"
              onClick={onClearError}
              aria-label="关闭错误提示"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}

        {/* 输入表单 */}
        <form onSubmit={handleSubmit} className="input-form">
          <div className={`textarea-container ${isFocused ? 'focused' : ''}`}>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="在这里输入你想练习的英文文本..."
              className="text-input"
              rows={6}
              disabled={isLoading}
            />
            {text && (
              <button
                type="button"
                className="clear-text-btn"
                onClick={handleClearText}
                aria-label="清除输入内容"
              >
                <X size={20} />
              </button>
            )}
            {!text && (
              <div className="sample-tags">
                <span className="sample-label">示例：</span>
                {[
                  { level: 'elementary', label: '小学' },
                  { level: 'middle', label: '中学' },
                  { level: 'gaokao', label: '高考' },
                  { level: 'cet', label: '四/六级' },
                  { level: 'ielts', label: '雅思' },
                  { level: 'toefl', label: '托福' }
                ].map((item, index) => (
                  <motion.button
                    key={index}
                    className="sample-tag"
                    onClick={() => handleSampleClick(item.level)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isLoading}
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
          
          <motion.button
            type="submit"
            className={`analyze-button ${!text.trim() || isLoading ? 'disabled' : ''}`}
            disabled={!text.trim() || isLoading}
            whileHover={!isLoading && text.trim() ? { scale: 1.02 } : {}}
            whileTap={!isLoading && text.trim() ? { scale: 0.98 } : {}}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner" />
                <span>AI正在分析中...</span>
              </>
            ) : (
              <>
                <Zap className="button-icon" />
                <span>智能分析</span>
              </>
            )}
          </motion.button>
        </form>



      </motion.div>
    </div>
  )
}

export default InputView