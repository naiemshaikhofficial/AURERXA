'use client'

import React, { useState, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { submitCustomOrder } from '@/app/actions'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export function CustomOrderForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    budget: '',
  })

  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  })

  // Subtle background pattern drift
  const yPattern = useTransform(scrollYProgress, [0, 1], [-50, 50])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleBudgetChange = (value: string) => {
    setFormData(prev => ({ ...prev, budget: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus('idle')

    const result = await submitCustomOrder(formData)

    if (result.success) {
      setStatus('success')
      setMessage(result.message!)
      setFormData({
        name: '',
        email: '',
        phone: '',
        description: '',
        budget: '',
      })
    } else {
      setStatus('error')
      setMessage(result.error!)
    }

    setIsLoading(false)
    setTimeout(() => setStatus('idle'), 5000)
  }

  return (
    <section ref={sectionRef} id="custom" className="py-24 md:py-32 px-6 lg:px-12 bg-black relative overflow-hidden">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mx-auto relative z-10"
      >
        <div className="text-center mb-24">
          <p className="text-amber-500/80 text-[10px] font-premium-sans mb-6">
            Bespoke Service
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-light mb-8 text-white tracking-widest italic">
            Custom <span className="text-amber-500">Jewelry</span>
          </h2>
          <div className="w-24 h-[1px] mx-auto bg-gradient-to-r from-transparent via-amber-500/30 to-transparent mb-8" />
          <p className="text-sm md:text-base text-white/40 max-w-xl mx-auto font-light leading-relaxed tracking-widest italic">
            Bring your vision to life. Our master craftsmen will create a bespoke piece just for you.
          </p>
        </div>

        <div className="bg-neutral-950 border border-white/5 p-8 md:p-16 relative overflow-hidden group hover:border-amber-500/20 transition-all duration-1000 shadow-[0_0_50px_rgba(0,0,0,1)]">
          <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <Label htmlFor="name" className="text-white/40 text-[9px] font-premium-sans">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your illustrious name"
                  required
                  className="bg-black/40 border-white/5 text-white placeholder:text-white/10 h-14 focus:border-amber-500/30 focus:ring-0 rounded-none text-xs tracking-widest"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="email" className="text-white/40 text-[9px] font-premium-sans">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@excellence.com"
                  required
                  className="bg-black/40 border-white/5 text-white placeholder:text-white/10 h-14 focus:border-amber-500/30 focus:ring-0 rounded-none text-xs tracking-widest"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <Label htmlFor="phone" className="text-white/40 text-[9px] font-premium-sans">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 (000) 000-0000"
                  className="bg-black/40 border-white/5 text-white placeholder:text-white/10 h-14 focus:border-amber-500/30 focus:ring-0 rounded-none text-xs tracking-widest"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="budget" className="text-white/40 text-[9px] font-premium-sans">
                  Budget Range
                </Label>
                <Select value={formData.budget} onValueChange={handleBudgetChange}>
                  <SelectTrigger className="bg-black/40 border-white/5 text-white/40 h-14 focus:border-amber-500/30 focus:ring-0 rounded-none text-xs tracking-widest">
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-white/10 text-white rounded-none">
                    <SelectItem value="under-50" className="focus:bg-amber-500/20 focus:text-white py-3">Under ₹50,000</SelectItem>
                    <SelectItem value="50-100" className="focus:bg-amber-500/20 focus:text-white py-3">₹50,000 - ₹100,000</SelectItem>
                    <SelectItem value="100-250" className="focus:bg-amber-500/20 focus:text-white py-3">₹100,000 - ₹250,000</SelectItem>
                    <SelectItem value="250-500" className="focus:bg-amber-500/20 focus:text-white py-3">₹250,000 - ₹500,000</SelectItem>
                    <SelectItem value="500-plus" className="focus:bg-amber-500/20 focus:text-white py-3">₹500,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <Label htmlFor="description" className="text-white/40 text-[9px] font-premium-sans">
                Describe Your Dream Piece
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell us about your design, materials, and inspiration..."
                required
                rows={6}
                className="bg-black/40 border-white/5 text-white placeholder:text-white/10 resize-none focus:border-amber-500/30 focus:ring-0 rounded-none text-xs tracking-widest leading-loose"
              />
            </div>

            {status === 'success' && (
              <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-4">
                <CheckCircle className="h-4 w-4 text-emerald-400 mt-1 flex-shrink-0" />
                <p className="text-[10px] text-white font-premium-sans tracking-widest uppercase">{message}</p>
              </div>
            )}

            {status === 'error' && (
              <div className="p-6 bg-red-500/5 border border-red-500/20 flex items-start gap-4">
                <AlertCircle className="h-4 w-4 text-red-400 mt-1 flex-shrink-0" />
                <p className="text-[10px] text-white font-premium-sans tracking-widest uppercase">{message}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-amber-500 hover:text-white font-bold uppercase tracking-[0.4em] h-16 text-[10px] transition-all duration-700 rounded-none shadow-2xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                'Request Custom Consultation'
              )}
            </Button>
          </form>

        </div>
      </motion.div>
    </section>
  )
}
