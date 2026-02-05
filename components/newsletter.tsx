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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-secondary to-background">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4 text-gradient-gold tracking-wider">
          Exclusive Offers
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Subscribe to receive exclusive offers, new collection launches, and insider access to our
          luxury pieces.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-background border-border text-foreground placeholder:text-muted-foreground h-12"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold uppercase tracking-widest px-8 h-12 whitespace-nowrap"
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
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-sm flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <p className="text-sm text-foreground">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-sm flex items-center justify-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-sm text-foreground">{message}</p>
            </div>
          )}
        </form>
      </div>
    </section>
  )
}
