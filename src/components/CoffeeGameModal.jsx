import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import './CoffeeGameModal.css'

const CoffeeGameModal = ({ isOpen, onClose }) => {
  const [donateClickCount, setDonateClickCount] = useState(0)
  const [donateShown, setDonateShown] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const donateRevealTimer = useRef(null)
  const steamContainer = useRef(null)
  const heartContainer = useRef(null)
  const coffeeMachine = useRef(null)
  const coffeeMachineOverlay = useRef(null)
  const coffeeHandle = useRef(null)

  // 重置状态当弹窗打开时
  useEffect(() => {
    if (isOpen) {
      setDonateClickCount(0)
      setDonateShown(false)
      setIsAnimating(false)
      if (donateRevealTimer.current) {
        clearTimeout(donateRevealTimer.current)
        donateRevealTimer.current = null
      }
      // 清空特效容器
      if (steamContainer.current) steamContainer.current.innerHTML = ''
      if (heartContainer.current) heartContainer.current.innerHTML = ''
      // 重置咖啡机图片
      if (coffeeMachine.current) coffeeMachine.current.src = '/coffee_images/coffee machine_01.png'
      if (coffeeMachineOverlay.current) coffeeMachineOverlay.current.style.opacity = '0'
    }
  }, [isOpen])

  // 创建蒸汽特效
  const createSteam = () => {
    if (!steamContainer.current) return
    
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const steam = document.createElement('div')
        steam.className = 'steam-particle'
        steam.style.left = `${45 + Math.random() * 10}%`
        steam.style.animationDelay = `${Math.random() * 0.5}s`
        steam.style.animationDuration = `${2 + Math.random()}s`
        steamContainer.current.appendChild(steam)
        
        setTimeout(() => {
          if (steam.parentNode) steam.parentNode.removeChild(steam)
        }, 3000)
      }, i * 100)
    }
  }

  // 创建爱心特效
  const createHearts = () => {
    if (!heartContainer.current) return
    
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const heart = document.createElement('div')
        heart.className = 'heart-particle'
        heart.innerHTML = '❤️'
        heart.style.left = `${40 + Math.random() * 20}%`
        heart.style.animationDelay = `${Math.random() * 0.3}s`
        heart.style.animationDuration = `${1.5 + Math.random() * 0.5}s`
        heartContainer.current.appendChild(heart)
        
        setTimeout(() => {
          if (heart.parentNode) heart.parentNode.removeChild(heart)
        }, 2500)
      }, i * 150)
    }
  }

  // 咖啡机动画
  const runCoffeeAnimation = () => {
    if (isAnimating) return
    setIsAnimating(true)

    // 手柄动画序列
    const handleFrames = [
      '/coffee_images/handle_1.png',
      '/coffee_images/handle_2.png', 
      '/coffee_images/handle_3.png',
      '/coffee_images/handle_4.png',
      '/coffee_images/handle_5.png',
      '/coffee_images/handle_4.png',
      '/coffee_images/handle_3.png',
      '/coffee_images/handle_2.png', 
      '/coffee_images/handle_1.png'
    ]

    let frameIndex = 0
    const handleInterval = setInterval(() => {
      if (coffeeHandle.current && frameIndex < handleFrames.length) {
        coffeeHandle.current.src = handleFrames[frameIndex]
        frameIndex++
      } else {
        clearInterval(handleInterval)
        // 重置手柄
        setTimeout(() => {
          if (coffeeHandle.current) {
            coffeeHandle.current.src = '/coffee_images/handle_1.png'
          }
        }, 500)
      }
    }, 220)

    // 蒸汽和爱心特效
    setTimeout(() => {
      createSteam()
      createHearts()
    }, 800)

    // 咖啡机状态变化 - 按顺序播放动画
    setTimeout(() => {
      const machineFrames = [
        '/coffee_images/coffee machine_02.png',
        '/coffee_images/coffee machine_03.png',
        '/coffee_images/coffee machine_04.png',
        '/coffee_images/coffee machine_05.png',
        '/coffee_images/coffee machine_06.png',
        '/coffee_images/coffee machine_07.png'
      ]
      
      let frameIndex = 0
      
      const playMachineAnimation = () => {
        if (!coffeeMachineOverlay.current || !coffeeMachine.current) {
          setIsAnimating(false)
          return
        }
        
        if (frameIndex < machineFrames.length) {
          coffeeMachineOverlay.current.src = machineFrames[frameIndex]
          coffeeMachineOverlay.current.style.opacity = '1'
          
          frameIndex++
          
          // 在 coffee machine_03.png (索引1) 静止1秒
          if (frameIndex === 2) {
            setTimeout(playMachineAnimation, 1000)
          }
          // 在 coffee machine_07.png (索引5) 静止2秒
          else if (frameIndex === 6) {
            setTimeout(() => {
              // 透明度变化回到默认图
              if (coffeeMachineOverlay.current) {
                coffeeMachineOverlay.current.style.opacity = '0'
              }
              setIsAnimating(false)
            }, 2000)
          }
          // 其他帧正常播放
          else {
            setTimeout(playMachineAnimation, 300)
          }
        }
      }
      
      playMachineAnimation()
    }, 2000)
  }

  // 处理手柄点击
  const handleCoffeeClick = () => {
    runCoffeeAnimation()
    const newCount = donateClickCount + 1
    setDonateClickCount(newCount)
    
    if (newCount === 2 && !donateShown) {
      if (donateRevealTimer.current) clearTimeout(donateRevealTimer.current)
      donateRevealTimer.current = setTimeout(() => {
        setDonateShown(true)
      }, 5000)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="coffee-modal"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3>☕ 请我喝咖啡</h3>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          
          <div className="donate-content">
            <p className="donate-description">
              如果这个项目对您有帮助，请考虑支持一下开发者！您的支持是我们持续改进的最大动力！
            </p>

            {/* 咖啡机小游戏 */}
            <div className="coffee-game-container">
              <div className="coffee-wrap">
                <div className="coffee-stage">
                  <div className="coffee-stack">
                    <div className="coffee-rig">
                      <img 
                        ref={coffeeMachine}
                        className="coffee-machine-image" 
                        alt="Coffee Machine" 
                        src="/coffee_images/coffee machine_01.png"
                      />
                      <img 
                        ref={coffeeMachineOverlay}
                        className="coffee-machine-overlay" 
                        alt="Coffee Machine Overlay" 
                        src="/coffee_images/coffee machine_01.png"
                      />
                      <img 
                        ref={coffeeHandle}
                        className="coffee-handle-image" 
                        alt="Handle" 
                        src="/coffee_images/handle_1.png"
                        onClick={handleCoffeeClick}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                    <img 
                      className="coffee-tip-image" 
                      alt="tip" 
                      src="/coffee_images/text_01.png"
                    />
                  </div>
                  <div ref={steamContainer} className="steam-container"></div>
                  <div ref={heartContainer} className="heart-container"></div>
                </div>
              </div>
            </div>

            {/* 支付方式展示 */}
            <div className={`payment-option ${donateShown ? 'show' : ''}`}>
              <h4>☕ 真的请我喝咖啡</h4>
              <div className="qr-placeholder">
                <img className="qr-img" src="/ali.png" alt="支付宝收款码" />
                <img className="qr-img" src="/wechat.png" alt="微信收款码" />
              </div>
            </div>

            <p className="donate-thanks">
              💖 无论多少，您的每一份心意我们都深深感激！
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CoffeeGameModal