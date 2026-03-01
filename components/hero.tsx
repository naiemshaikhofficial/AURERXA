'use client'

import React, { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { fadeInUp, staggerContainer, PREMIUM_EASE } from '@/lib/animation-constants'

export function Hero() {
  const ref = useRef(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { scrollYProgress } = useScroll({
    target: isMounted ? ref : undefined,
    offset: ['start start', 'end start'],
  })

  // Low-pass filter for scroll noise (Anti-Jitter)
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.5,
    restDelta: 0.0001
  })

  // Deep Parallax - Optimized with Smoothing
  const yBg = useTransform(smoothProgress, [0, 1], ['0vh', '50vh'])
  const yText = useTransform(smoothProgress, [0, 1], ['0vh', '25vh']) // Strong foreground separation
  const opacityFade = useTransform(smoothProgress, [0, 0.5], [1, 0])

  // Spotlight Parallax
  const ySpotlight = useTransform(scrollYProgress, [0, 1], [0, -300]) // Increased 2x

  return (
    <section ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden bg-background text-foreground">
      {/* 1. Cinematic Background Layer */}
      <motion.div
        style={{ y: yBg, translateZ: 0 }}
        className="absolute inset-0 z-0 will-change-transform"
      >
        <div className="absolute inset-0 bg-background/70 z-10" /> {/* Matte Dimmer */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40 z-10" />

        {/* High-Res Luxury Background */}
        <div className="relative w-full h-full">
          <Image
            src="/pexels-the-glorious-studio-3584518-29245554.webp"
            alt="Cinematic Luxury Jewelry Background - AURERXA Heritage"
            fill
            priority
            fetchPriority="high"
            quality={75}
            className="object-cover object-center scale-100 dark:opacity-70 opacity-30"
            sizes="100vw"
          />
        </div>
      </motion.div>

      {/* 2. Atmospheric Effects - Subtle & Clean */}
      <div className="absolute inset-0 z-[5] pointer-events-none">

      </div>

      {/* 3. Main Content - Refined Typography with Parallax */}
      <div
        className="relative z-10 w-full max-w-7xl px-6 flex flex-col items-center justify-center text-center will-change-transform"
      >
        <div className="space-y-10">
          {/* Logo Brand Mark - Instant LCP */}
          <div className="mb-6 relative inline-block">
            <Image
              src="/logo-new-v2.png"
              alt="AURERXA Official Logo"
              width={160}
              height={64}
              priority
              className="w-24 md:w-36 h-auto relative z-10 opacity-90 drop-shadow-2xl dark:invert-0"
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[10rem] font-serif font-black tracking-tighter text-foreground leading-[0.85] md:leading-[0.8] animate-in slide-in-from-bottom-4 fade-in duration-1000 ease-out">
              PURE<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200/40 via-blue-200/60 to-slate-400/40 italic">PRESTIGE</span>
            </h1>
          </div>

          <p className="max-w-xl mx-auto text-base sm:text-lg md:text-xl font-light tracking-wide text-muted-foreground/90 animate-in slide-in-from-bottom-2 fade-in duration-1000 delay-150 ease-out fill-mode-both">
            Handcrafted luxury. Timeless heritage.
          </p>

          <Link href="/collections" className="group relative inline-block px-8 sm:px-12 py-4 sm:py-5 border border-primary/20 bg-primary/5 text-primary font-premium-sans text-[10px] sm:text-[11px] uppercase tracking-[0.4em] hover:bg-primary hover:text-primary-foreground transition-all duration-700 overflow-hidden shadow-2xl mt-8 md:mt-16" aria-label="Discover the Collection">
            <span className="relative z-10">Discover Collection</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform [transition-duration:1500ms] ease-in-out" />
          </Link>
        </div>
      </div>

    </section>
  )
}
