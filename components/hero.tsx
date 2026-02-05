'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  // Smooth parallax for the logo
  const yLogo = useTransform(scrollYProgress, [0, 1], [0, 100])
  const opacityLogo = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Rolex-inspired Background */}
      <div className="absolute inset-0">
        {/* Deep Emerald to Black Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#004028] via-black to-black opacity-90" />

        {/* Subtle Radial Highlights */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-500/10 rounded-full blur-[100px]" />

        {/* Precision Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl px-6 text-center">
        <motion.div
          style={{ y: yLogo, opacity: opacityLogo }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-12"
        >
          {/* Logo with sophisticated glow */}
          <div className="relative inline-block group">
            <div className="absolute inset-0 bg-amber-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <img
              src="/logo.png"
              alt="AURERXA"
              className="w-full h-auto object-contain max-h-48 md:max-h-[28rem] relative z-10 drop-shadow-[0_0_30px_rgba(255,215,0,0.1)]"
            />
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            <p className="text-[10px] md:text-xs font-premium-sans tracking-[0.5em] text-amber-500/80 uppercase">
              The Epitome of Craftsmanship
            </p>
            <h1 className="text-white text-sm md:text-base font-serif italic tracking-[0.2em] opacity-40">
              Timeless Excellence Since 1989
            </h1>
          </div>
        </motion.div>
      </div>

      {/* Decorative Corner Accents */}
      <div className="absolute top-10 left-10 w-32 h-32 border-t border-l border-white/5" />
      <div className="absolute bottom-10 right-10 w-32 h-32 border-b border-r border-white/5" />

      {/* Hero Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <div className="w-px h-16 bg-gradient-to-b from-amber-500/50 to-transparent" />
        <span className="text-[8px] font-premium-sans tracking-[0.3em] text-white/30">Scroll</span>
      </motion.div>
    </section>
  )
}
