'use client'

import React, { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { fadeInUp, staggerContainer, PREMIUM_EASE } from '@/lib/animation-constants'

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
    <section ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden bg-background text-foreground">
      {/* 1. Cinematic Background Layer */}
      <motion.div
        style={{ y: yBg }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-background/70 z-10" /> {/* Matte Dimmer */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40 z-10" />

        {/* High-Res Luxury Background */}
        <div className="relative w-full h-full">
          <Image
            src="/pexels-the-glorious-studio-3584518-29245554.jpg"
            alt="Black Edition Background"
            fill
            priority
            quality={90}
            className="object-cover object-center scale-105 dark:opacity-70 opacity-30"
          />
        </div>
      </motion.div>

      {/* 2. Atmospheric Effects - Subtle & Clean */}
      <div className="absolute inset-0 z-[5] pointer-events-none">
        {/* Subtle Grain instead of Scanlines for analog luxury feel */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      </div>

      {/* 3. Main Content - Refined Typography */}
      <div className="relative z-10 w-full max-w-7xl px-6 flex flex-col items-center justify-center text-center">
        <motion.div
          style={{ y: yText }}
          className="space-y-10"
        >
          {/* Logo Brand Mark - No Glow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: PREMIUM_EASE }}
            className="mb-6 relative inline-block"
          >
            <img
              src="/logo.png"
              alt="Aurerxa Logo"
              className="w-20 md:w-28 h-auto relative z-10 opacity-90 drop-shadow-xl dark:invert-0 invert"
            />
          </motion.div>

          <div className="space-y-4">
            {/* Elegant Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: PREMIUM_EASE }}
              className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium tracking-tight text-foreground/90 leading-[1.1]"
            >
              PURE<br />
              <span className="text-muted-foreground font-light italic">PRESTIGE</span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: PREMIUM_EASE }}
            className="max-w-lg mx-auto text-muted-foreground font-light text-sm md:text-base tracking-widest leading-loose uppercase"
          >
            Forged in shadow. Defined by brilliance.<br />
            The quiet authority of true luxury.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: PREMIUM_EASE }}
            className="pt-10"
          >
            <button className="group relative px-10 py-4 border border-border text-foreground font-premium-sans text-[10px] uppercase tracking-[0.3em] hover:border-primary/50 hover:text-primary transition-all duration-700">
              <span className="relative z-10">Discover Collection</span>
              <div className="absolute inset-0 bg-foreground/[0.02] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-700 -z-0" />
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* 4. Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 60 }}
        transition={{ delay: 1.5, duration: 1.5 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-t from-transparent via-foreground/20 to-transparent hidden md:block"
      />
    </section>
  )
}
