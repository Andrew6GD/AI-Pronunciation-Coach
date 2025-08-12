import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import BrainLogo from './BrainLogo'
import './LoadingSpinner.css'

const LoadingSpinner = () => {
  return (
    <motion.div 
      className="loading-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="loading-content">
        <div className="loading-icon">
          <motion.div
            className="brain-container"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <BrainLogo className="brain" size={48} />
          </motion.div>
          
          <motion.div
            className="sparkles-container"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
          >
            <Sparkles className="sparkles" />
          </motion.div>
        </div>
        
        <div className="loading-text">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            AI正在分析中...
          </motion.h3>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            正在为您生成专业的发音指导
          </motion.p>
        </div>
        
        <div className="loading-progress">
          <motion.div 
            className="progress-bar"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
          />
        </div>
        
        <div className="loading-dots">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="dot"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default LoadingSpinner