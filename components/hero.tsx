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
    <section ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden bg-neutral-950 text-white">
      {/* 1. Cinematic Background Layer */}
      <motion.div
        style={{ y: yBg }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-neutral-950/60 z-10" /> {/* Matte Dimmer */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/40 z-10" />

        {/* High-Res Luxury Background */}
        <div className="relative w-full h-full">
          <Image
            src="/pexels-the-glorious-studio-3584518-29245554.jpg"
            alt="Black Edition Background"
            fill
            priority
            quality={90}
            className="object-cover object-center scale-105 opacity-80"
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
          style={{ y: yText, opacity: opacityFade }}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-10"
        >
          {/* Logo Brand Mark - No Glow */}
          <div className="mb-6 relative inline-block">
            <img
              src="/logo.png"
              alt="Aurerxa Logo"
              className="w-20 md:w-28 h-auto relative z-10 opacity-90 drop-shadow-xl"
            />
          </div>

          <div className="space-y-2">
            {/* Elegant Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium tracking-tight text-white/90 leading-[1.1]">
              PURE<br />
              <span className="text-white/40 font-light italic">PRESTIGE</span>
            </h1>
          </div>

          <p className="max-w-lg mx-auto text-white/50 font-light text-sm md:text-base tracking-widest leading-loose uppercase">
            Forged in shadow. Defined by brilliance.<br />
            The quiet authority of true luxury.
          </p>

          <div className="pt-10">
            <button className="group relative px-10 py-4 border border-white/20 text-white font-premium-sans text-[10px] uppercase tracking-[0.3em] hover:border-primary/50 hover:text-primary transition-all duration-700">
              <span className="relative z-10">Discover Collection</span>
              <div className="absolute inset-0 bg-white/[0.02] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-700 -z-0" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* 4. Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 60 }}
        transition={{ delay: 1.5, duration: 1.5 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-t from-transparent via-white/20 to-transparent hidden md:block"
      />
    </section>
  )
}
