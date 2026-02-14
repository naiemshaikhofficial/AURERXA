'use client'

import { useEffect, useState } from 'react'

export function ScrollProgress() {
  // Optimized: No state updates on scroll, direct DOM manipulation
  const ref = useState<HTMLDivElement | null>(null)[1] // Logic handled via callback ref or just imperative

  useEffect(() => {
    const progressBar = document.getElementById('scroll-progress-bar')
    if (!progressBar) return

    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight
          const scrolled = (window.scrollY / totalHeight)
          progressBar.style.transform = `scaleX(${scrolled})`
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      id="scroll-progress-bar"
      className="scroll-indicator will-change-transform"
      style={{
        transform: 'scaleX(0)',
        transformOrigin: 'left'
      }}
    />
  )
}
