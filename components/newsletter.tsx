'use client'

import React from "react"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { subscribeNewsletter } from '@/app/actions'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

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
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-950 relative overflow-hidden">
      {/* Subtle gold gradient */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-500/30 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-2xl mx-auto text-center relative z-10">
        {/* Decorative top line */}
        <div className="w-16 h-px mx-auto mb-8 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        <p className="text-amber-400 text-sm tracking-[0.3em] uppercase mb-4 font-light">
          Stay Connected
        </p>
        <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-6 text-white tracking-tight">
          Exclusive Offers
        </h2>
        <p className="text-base text-white/50 mb-10 font-light leading-relaxed">
          Subscribe to receive exclusive offers, new collection launches, and insider access to our luxury pieces.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-neutral-900 border-neutral-800 text-white placeholder:text-white/30 h-14 focus:border-amber-500/50 focus:ring-amber-500/20"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-medium uppercase tracking-[0.15em] px-10 h-14 whitespace-nowrap text-sm transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subscribing...
                </>
              ) : (
                'Subscribe'
              )}
            </Button>
          </div>

          {status === 'success' && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <p className="text-sm text-white">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 flex items-center justify-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="text-sm text-white">{message}</p>
            </div>
          )}
        </form>

        {/* Decorative bottom line */}
        <div className="w-16 h-px mx-auto mt-12 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
      </div>
    </section>
  )
}
