import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import BrainLogo from './BrainLogo'
import './Header.css'

const Header = ({ isDetailPage = false }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (isDetailPage) {
    return (
      <motion.header 
        className="header detail-header"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className={`compact-logo ${isExpanded ? 'expanded' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="logo-icon">
            <BrainLogo className="brain-icon" size={64} />
          </div>
          {isExpanded && (
            <motion.div 
              className="logo-text"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1>AI Pronunciation Coach</h1>
              <p>智能发音教练</p>
            </motion.div>
          )}
          <div className="expand-icon">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </motion.div>
      </motion.header>
    )
  }

  return (
    <motion.header 
      className="header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="header-content">
        <motion.div 
          className="logo"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="logo-icon">
            <BrainLogo className="brain-icon" size={64} />
            <Mic className="mic-icon" />
            <Sparkles className="sparkles-icon" />
          </div>
          <div className="logo-text">
            <h1>AI Pronunciation Coach</h1>
            <p>智能发音教练</p>
          </div>
        </motion.div>
        
        <nav className="nav">
          <motion.div 
            className="nav-item"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="nav-badge">Beta</span>
          </motion.div>
        </nav>
      </div>
    </motion.header>
  )
}

export default Header