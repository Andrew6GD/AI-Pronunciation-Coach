import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Send } from 'lucide-react'
import emailjs from '@emailjs/browser'
import CoffeeGameModal from './CoffeeGameModal'
import './FloatingActions.css'

// 反馈图标组件
const FeedbackIcon = () => (
  <svg width="32" height="32" viewBox="0 0 514 514" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M263.279 114C337.569 114 397.793 174.224 397.794 248.515C397.794 322.805 337.569 383.029 263.279 383.029C237.907 383.029 214.176 376.003 193.923 363.792L130.951 399.286C122.552 404.02 112.978 395.297 116.911 386.495L147.759 317.467C135.698 297.303 128.763 273.719 128.763 248.515C128.763 174.224 188.989 114 263.279 114ZM206.582 232.512C197.743 232.512 190.578 239.676 190.578 248.515C190.578 257.353 197.743 264.519 206.582 264.519C215.42 264.518 222.585 257.353 222.585 248.515C222.584 239.676 215.42 232.512 206.582 232.512ZM266.269 232.512C257.431 232.512 250.266 239.676 250.266 248.515C250.266 257.353 257.431 264.518 266.269 264.519C275.108 264.519 282.273 257.353 282.273 248.515C282.273 239.676 275.107 232.512 266.269 232.512ZM326.823 232.512C317.984 232.512 310.82 239.676 310.82 248.515C310.82 257.353 317.984 264.519 326.823 264.519C335.661 264.519 342.826 257.353 342.826 248.515C342.826 239.676 335.661 232.512 326.823 232.512Z" fill="url(#paint0_linear_11_45)"/>
    <defs>
      <linearGradient id="paint0_linear_11_45" x1="256.897" y1="114" x2="256.897" y2="400.62" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38A8FF"/>
        <stop offset="1" stopColor="#0472C6"/>
      </linearGradient>
    </defs>
  </svg>
)

// 支持图标组件
const SupportIcon = () => (
  <svg width="32" height="32" viewBox="0 0 514 514" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M116.74 184.241C155.497 120.873 243.921 173.706 258.946 193.309C273.971 173.706 357.688 121.735 396.445 185.103C435.201 248.472 392.803 275.37 367.761 302.267C350.701 320.592 306.381 361.767 279.862 386.154L279.912 386.155L278.132 387.745C276.666 389.092 275.262 390.382 273.926 391.607C273.589 391.916 273.238 392.191 272.879 392.437L266.668 397.99C262.037 402.128 255.014 402.049 250.477 397.808L237.524 385.699H237.535C210.963 361.258 167.085 320.478 150.13 302.267C125.089 275.37 77.9834 247.609 116.74 184.241ZM258.946 385.929H258.996C258.964 385.612 258.946 385.288 258.946 384.958V385.929Z" fill="url(#paint0_linear_11_44)"/>
    <defs>
      <linearGradient id="paint0_linear_11_44" x1="257.045" y1="154" x2="257.045" y2="401.042" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF7A9B"/>
        <stop offset="1" stopColor="#ED456D"/>
      </linearGradient>
    </defs>
  </svg>
)

const FloatingActions = () => {
  const [showFeedback, setShowFeedback] = useState(false)
  const [showSupport, setShowSupport] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDonateModal, setShowDonateModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  // 移除isVisible状态，直接显示

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    if (!feedback.trim()) return
    
    setIsSubmitting(true)
    
    try {
      // 使用 EmailJS 发送邮件
      const templateParams = {
        user_email: email || '未提供邮箱',
        message: feedback,
        to_email: 'design.andrewliu@gmail.com'
      }
      
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      
      alert('感谢您的反馈！邮件已成功发送，我们会认真考虑您的建议。')
      setFeedback('')
      setEmail('')
      setShowFeedback(false)
    } catch (error) {
      console.error('发送邮件失败:', error)
      alert('发送失败，请稍后重试或直接联系我们：design.andrewliu@gmail.com')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="floating-actions floating-actions-ready">
        <button
          className="fab fab-feedback"
          onClick={() => {
            setShowSupport(false) // 关闭支持弹窗
            setShowFeedback(true)
          }}
        >
          <FeedbackIcon />
        </button>
        <button
          className="fab fab-support"
          onClick={() => {
            setShowFeedback(false) // 关闭反馈弹窗
            setShowSupport(true)
          }}
        >
          <SupportIcon />
        </button>
      </div>

      {/* 反馈弹窗 */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFeedback(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>💬 反馈建议</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowFeedback(false)}
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleFeedbackSubmit} className="feedback-form">
                <div className="form-group">
                  <label htmlFor="email">邮箱 (可选)</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="feedback">您的建议或问题 *</label>
                  <textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="请告诉我们您的使用体验、发现的问题或改进建议..."
                    className="form-textarea"
                    rows={4}
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting || !feedback.trim()}
                >
                  {isSubmitting ? (
                    <span>提交中...</span>
                  ) : (
                    <>
                      <Send size={16} />
                      发送反馈
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 支持弹窗 */}
      <AnimatePresence>
        {showSupport && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSupport(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>❤️ 支持项目</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowSupport(false)}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="support-content">
                <p className="support-description">
                  这个AI发音教练项目完全免费开源，旨在帮助更多人提升英语发音。
                </p>
                
                <div className="cost-breakdown">
                  <h4>💰 项目成本</h4>
                  <ul>
                    <li>语音合成服务费用 (TTS API)</li>
                    <li>开发和测试</li>
                    <li>日常维护管理</li>
                    <li>……</li>
                  </ul>
                </div>
                
                <div className="support-ways">
                  <h4>🎯 支持方式</h4>
                  <div className="support-buttons">
                    <button 
                      className="support-btn github"
                      onClick={() => {
                        window.open('https://github.com/Andrew6GD?tab=repositories', '_blank')
                      }}
                    >
                      ⭐ GitHub
                    </button>
                    <button 
                      className="support-btn share"
                      onClick={() => setShowShareModal(true)}
                    >
                      📢 分享推荐
                    </button>
                    <button 
                      className="support-btn donate"
                      onClick={() => setShowDonateModal(true)}
                    >
                      ☕ 请我喝咖啡<span className="subtext">（小游戏）</span>
                    </button>
                  </div>
                </div>
                
                <p className="support-thanks">
                  您的每一份支持都是我们持续改进的动力！🚀
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 分享弹窗 */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>📢 分享推荐</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowShareModal(false)}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="share-content">
                <p className="share-description">
                  帮助更多人发现这个免费的AI发音教练！
                </p>
                
                <div className="share-options">
                  <button 
                    className="share-btn wechat"
                    onClick={() => {
                      navigator.clipboard.writeText('推荐一个超棒的AI英语发音教练：https://aipronunciationcoach.netlify.app/ 完全免费，实时语音识别和发音纠正！')
                      alert('分享文案已复制到剪贴板！\n\n您可以粘贴到微信、QQ或其他社交平台分享给朋友。')
                    }}
                  >
                    💬 复制分享文案
                  </button>
                  
                  <button 
                    className="share-btn xiaohongshu"
                    onClick={() => {
                      window.open('https://www.xiaohongshu.com/user/profile/593e471d82ec3911ec945324', '_blank')
                    }}
                  >
                    📱 小红书点个赞
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 咖啡游戏弹窗 */}
      <CoffeeGameModal 
        isOpen={showDonateModal} 
        onClose={() => setShowDonateModal(false)} 
      />
    </>
  )
}

export default FloatingActions