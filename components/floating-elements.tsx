'use client'

import { motion } from 'framer-motion'

export function FloatingElements() {
  const elements = [
    { size: 'w-2 h-2', delay: 0, duration: 25, x: '15%', y: '25%' },
    { size: 'w-2 h-2', delay: 3, duration: 28, x: '85%', y: '35%' },
    { size: 'w-1.5 h-1.5', delay: 6, duration: 22, x: '65%', y: '75%' },
  ]

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
      {elements.map((el, i) => (
        <motion.div
          key={i}
          className={`${el.size} rounded-full bg-gradient-to-br from-primary/30 to-primary/10 absolute blur-md`}
          style={{ left: el.x, top: el.y }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: el.duration,
            delay: el.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
