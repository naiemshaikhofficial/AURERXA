'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  // Multi-layered parallax transforms
  const yLogo = useTransform(scrollYProgress, [0, 1], [0, 150])
  const yText = useTransform(scrollYProgress, [0, 1], [0, 80])
  const yLight1 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const yLight2 = useTransform(scrollYProgress, [0, 1], [0, -50])
  const opacityFade = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const scaleLogo = useTransform(scrollYProgress, [0, 1], [1, 1.05])

  return (
    <section ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Rolex-inspired Background Layers */}
      <div className="absolute inset-0">
        {/* Deep Emerald to Black Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#004028] via-black to-black opacity-90" />

        {/* Cinematic Shutter Reveal Mask */}
        <motion.div
          initial={{ clipPath: 'inset(100% 0 0 0)' }}
          animate={{ clipPath: 'inset(0% 0 0 0)' }}
          transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 bg-[#006039]/10"
        />

        {/* Golden Dust Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                x: Math.random() * 100 + '%',
                y: Math.random() * 100 + '%'
              }}
              animate={{
                opacity: [0, 0.3, 0],
                y: [null, '-20%', '-40%'],
                x: [null, (Math.random() - 0.5) * 20 + '%']
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                ease: 'linear',
                delay: Math.random() * 5
              }}
              className="absolute w-[1px] h-[1px] bg-amber-500/40 rounded-full blur-[1px]"
            />
          ))}
        </div>

        {/* Cinematic Light Leaks (Parallax) */}
        <motion.div
          style={{ y: yLight1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1000px] bg-emerald-500/5 rounded-full blur-[180px]"
        />
        <motion.div
          style={{ y: yLight2 }}
          className="absolute top-1/3 left-1/3 w-[800px] h-[600px] bg-amber-500/10 rounded-full blur-[150px]"
        />

      </div>

      <div className="relative z-10 w-full max-w-7xl px-6 text-center">
        <motion.div
          style={{ opacity: opacityFade }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-12"
        >
          {/* Logo with sophisticated glow - Independent Parallax */}
          <motion.div
            style={{ y: yLogo, scale: scaleLogo }}
            className="relative inline-block group"
          >
            <div className="absolute inset-[-100px] bg-amber-500/10 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            <img
              src="/logo.png"
              alt="AURERXA"
              className="w-full h-auto object-contain max-h-48 md:max-h-[28rem] relative z-10 drop-shadow-[0_0_50px_rgba(255,215,0,0.15)]"
            />
          </motion.div>

          {/* Text Content - Independent Parallax Segment */}
          <motion.div
            style={{ y: yText }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <p className="text-[10px] md:text-xs font-premium-sans text-amber-500/80">
              The Epitome of Craftsmanship
            </p>
            <h1 className="text-white text-base md:text-xl font-serif-luxury italic opacity-50">
              Timeless Excellence Since 1989
            </h1>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative Corner Accents */}
      <div className="absolute top-20 left-20 w-32 h-32 border-t border-l border-white/5" />
      <div className="absolute bottom-20 right-20 w-32 h-32 border-b border-r border-white/5" />

      {/* Hero Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1.5 }}
        className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6"
      >
        <div className="w-[1px] h-24 bg-gradient-to-b from-amber-500/50 via-amber-500/20 to-transparent" />
        <span className="text-[10px] font-premium-sans tracking-[0.5em] text-white/20 uppercase">Explore</span>
      </motion.div>
    </section>
  )
}
