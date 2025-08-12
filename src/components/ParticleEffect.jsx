import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './ParticleEffect.css'

const ParticleEffect = ({ particles }) => {
  return (
    <div className="particle-container">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="particle"
            initial={{
              x: particle.x,
              y: particle.y,
              scale: 0,
              rotate: 0,
              opacity: 1
            }}
            animate={{
              x: particle.x + (Math.random() - 0.5) * 100,
              y: particle.y - 60 - Math.random() * 40,
              scale: [0, 1, 0.8, 0],
              rotate: Math.random() * 360,
              opacity: [1, 1, 0.8, 0]
            }}
            exit={{
              scale: 0,
              opacity: 0
            }}
            transition={{
              duration: 1,
              ease: "easeOut"
            }}
            style={{
              backgroundColor: particle.color,
              width: particle.size,
              height: particle.size
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

export default ParticleEffect