'use client'

import React, { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

export function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  // Deep Parallax with Spring Physics for "Heavy" Premium Feel
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 }
  const yBg = useSpring(useTransform(scrollYProgress, [0, 1], [0, 200]), springConfig)
  const yText = useSpring(useTransform(scrollYProgress, [0, 1], [0, 100]), springConfig)
  const opacityFade = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  // Spotlight Parallax
  const ySpotlight = useTransform(scrollYProgress, [0, 1], [0, -150])

  return (
    <section ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden bg-black text-white">
      {/* 1. Cinematic Background Layer */}
      <motion.div
        style={{ y: yBg }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-black/40 z-10" /> {/* Dimmer */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 z-10" /> {/* Vignette */}

        {/* High-Res Luxury Background (Optimized with Next.js Image) */}
        <div className="relative w-full h-full">
          <Image
            src="/pexels-the-glorious-studio-3584518-29245554.jpg"
            alt="Black Edition Background"
            fill
            priority
            quality={90}
            className="object-cover object-center scale-105"
          />
        </div>
      </motion.div>

      {/* 2. "Cayenne Black" Atmospheric Effects */}
      <div className="absolute inset-0 z-[5] pointer-events-none">
        {/* Scanlines for that "Tech/Auto" precision feel - CSS Implementation */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.5) 50%, transparent 50%)',
            backgroundSize: '100% 3px'
          }}
        />

        {/* Spotlight Effect */}
        <motion.div
          style={{ y: ySpotlight }}
          className="absolute -top-[50%] left-1/2 -translate-x-1/2 w-[150vw] h-[150vw] bg-white/[0.05] rounded-full blur-[100px] mix-blend-overlay"
        />
      </div>

      {/* 3. Main Content - High Contrast & Bold Typography */}
      <div className="relative z-10 w-full max-w-7xl px-6 flex flex-col items-center justify-center text-center">
        <motion.div
          style={{ y: yText, opacity: opacityFade }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-12"
        >
          {/* Logo Brand Mark */}
          <div className="mb-8 relative inline-block">
            {/* Sharper, more defined gold glow */}
            <div className="absolute inset-[-20px] bg-amber-500/10 blur-[40px] rounded-full opacity-0 animate-pulse-slow" />
            <img
              src="/logo.png"
              alt="Aurerxa Logo"
              className="w-24 md:w-32 h-auto relative z-10 drop-shadow-2xl"
            />
          </div>

          <div className="space-y-4">


            {/* Massive Bold Headline */}
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-black tracking-tighter text-white leading-[0.9] mix-blend-hard-light drop-shadow-2xl">
              PURE<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/20">PRESTIGE</span>
            </h1>
          </div>

          <p className="max-w-xl mx-auto text-white/60 font-medium text-lg md:text-xl tracking-wide leading-relaxed border-l-2 border-amber-500 pl-6 text-left">
            Forged in shadow. Defined by brilliance. <br />
            Experience the darker side of luxury.
          </p>

          <div className="pt-8">
            <button className="group relative px-12 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-colors duration-500 overflow-hidden">
              <span className="relative z-10">Discover Collection</span>
              <div className="absolute inset-0 bg-neutral-900 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 -z-0" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* 4. Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 100 }}
        transition={{ delay: 1, duration: 1.5 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-amber-500/50 hidden md:block"
      />
    </section>
  )
}
