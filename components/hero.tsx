'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { motion, useScroll, useTransform } from 'framer-motion'

export function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const yLogo = useTransform(scrollYProgress, [0, 1], [0, 200])
  const yText = useTransform(scrollYProgress, [0, 1], [0, 100])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-secondary via-background to-background">
      {/* Decorative background element */}
      <motion.div
        style={{ y: yText, opacity }}
        className="absolute inset-0 opacity-10"
      >
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-card rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
      </motion.div>

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
        <motion.div
          style={{ y: yLogo }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative w-full max-w-lg mx-auto mb-8"
        >
          <Image
            src="/logo.png"
            alt="AURERXA"
            width={600}
            height={200}
            className="w-full h-auto object-contain drop-shadow-2xl"
            priority
          />
        </motion.div>

        <motion.p
          style={{ y: yText }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="text-xl sm:text-2xl md:text-3xl font-light mb-8 text-foreground/80 max-w-3xl mx-auto text-balance tracking-wide"
        >
          Timeless Luxury Crafted to Perfection
        </motion.p>

        <motion.p
          style={{ y: yText }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="text-sm sm:text-base md:text-lg text-muted-foreground mb-16 max-w-xl mx-auto leading-relaxed"
        >
          Discover our exquisite collection of premium jewelry, each piece a masterpiece of elegance
          and sophistication
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/collections">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold uppercase tracking-widest px-8 h-12"
            >
              Explore Collection
            </Button>
          </Link>

          <Link href="#custom">
            <Button
              variant="outline"
              size="lg"
              className="border-accent text-accent hover:bg-accent/10 font-semibold uppercase tracking-widest px-8 h-12 bg-transparent"
            >
              Custom Order
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <svg
          className="w-6 h-6 text-accent"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </section>
  )
}
