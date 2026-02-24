'use client'

import React, { useState, useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { subscribeNewsletter } from '@/app/actions'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  const yContent = useTransform(smoothProgress, [0, 1], [100, -100])
  const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus('idle')

    const result = await subscribeNewsletter(email)

    if (result.success) {
      setStatus('success')
      setMessage(result.message!)
      setEmail('')
    } else {
      setStatus('error')
      setMessage(result.error!)
    }

    setIsLoading(false)
    setTimeout(() => setStatus('idle'), 5000)
  }

  return (
    <section ref={sectionRef} className="py-24 md:py-48 px-6 lg:px-12 bg-card relative overflow-hidden">

      <motion.div
        style={{ y: yContent, opacity }}
        className="max-w-xl mx-auto text-center relative z-10"
      >
        <div className="space-y-8 md:space-y-12">
          <div className="space-y-4">
            <p className="text-primary/80 text-[10px] font-premium-sans">
              Private Membership
            </p>
          </div>

          <h2 className="text-3xl md:text-6xl font-serif font-light text-foreground tracking-widest italic">
            Exclusive <span className="text-primary">Access</span>
          </h2>

          <p className="text-sm text-muted-foreground font-light leading-relaxed tracking-widest italic">
            Join our inner circle for privileged access to collections and the latest stories of excellence.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="bg-background/40 border-border text-foreground placeholder:text-muted-foreground/50 h-16 rounded-none text-center font-premium-sans tracking-widest focus:border-primary/30 transition-all duration-500"
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-foreground text-background hover:bg-primary hover:text-primary-foreground transition-all duration-700 rounded-none h-16 text-[10px] font-premium-sans tracking-[0.4em] uppercase shadow-2xl"
              >
                {isLoading ? 'Processing...' : 'Request Access'}
              </Button>
            </div>

            {status === 'success' && (
              <div className="alert-luxury-success animate-in fade-in slide-in-from-bottom-2 duration-700">
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle size={14} className="text-emerald-500" />
                  <p>{message}</p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="alert-luxury-error animate-in fade-in slide-in-from-bottom-2 duration-700">
                <div className="flex items-center justify-center gap-3">
                  <AlertCircle size={14} className="text-destructive" />
                  <p>{message}</p>
                </div>
              </div>
            )}
          </form>
        </div>
      </motion.div>
    </section>
  )
}
