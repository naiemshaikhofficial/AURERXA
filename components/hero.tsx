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
  const springConfig = { stiffness: 40, damping: 30, mass: 1, restDelta: 0.001 }
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
        className="absolute inset-0 z-0 will-change-transform"
      >
        <div className="absolute inset-0 bg-background/70 z-10" /> {/* Matte Dimmer */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40 z-10" />

        {/* High-Res Luxury Background */}
        <div className="relative w-full h-full">
          <Image
            src="/pexels-the-glorious-studio-3584518-29245554.webp"
            alt=""
            fill
            priority
            fetchPriority="high"
            quality={75}
            className="object-cover object-center scale-105 dark:opacity-70 opacity-30"
            sizes="100vw"
          />
        </div>
      </motion.div>

      {/* 2. Atmospheric Effects - Subtle & Clean */}
      <div className="absolute inset-0 z-[5] pointer-events-none">

      </div>

      {/* 3. Main Content - Refined Typography */}
      <div className="relative z-10 w-full max-w-7xl px-6 flex flex-col items-center justify-center text-center">
        <div className="space-y-10">
          {/* Logo Brand Mark - Removed motion wrapper for instant LCP */}
          <div className="mb-6 relative inline-block">
            <Image
              src="/logo.webp"
              alt=""
              width={112}
              height={112}
              priority
              loading="eager"
              className="w-20 md:w-28 h-auto relative z-10 opacity-90 drop-shadow-xl dark:invert-0 invert"
            />
          </div>

          <div className="space-y-4">
            {/* Elegant Headline - Lighter animation for TBT */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: PREMIUM_EASE }}
              className="text-4xl sm:text-6xl md:text-8xl lg:text-[10rem] font-serif font-black tracking-tighter text-foreground leading-[0.85] md:leading-[0.8]"
            >
              PURE<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200/40 via-amber-500/60 to-amber-700/40 italic drop-shadow-2xl">PRESTIGE</span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: PREMIUM_EASE }}
            className="max-w-lg mx-auto text-muted-foreground font-light text-[10px] sm:text-xs md:text-base tracking-widest leading-loose uppercase px-4 sm:px-0"
          >
            Forged in shadow. Defined by brilliance.<br />
            The quiet authority of true luxury.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: PREMIUM_EASE }}
            className="pt-8 md:pt-16"
          >
            <button className="group relative px-8 sm:px-12 py-4 sm:py-5 border border-primary/20 bg-primary/5 text-primary font-premium-sans text-[10px] sm:text-[11px] uppercase tracking-[0.4em] hover:bg-primary hover:text-primary-foreground transition-all duration-700 overflow-hidden shadow-2xl" aria-label="Discover the Collection">
              <span className="relative z-10">Discover Collection</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[1500ms] ease-in-out" />
            </button>
          </motion.div>
        </div>
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
