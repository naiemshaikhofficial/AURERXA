'use client'

import React from "react"
import { useState } from 'react'
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
    <section id="custom" className="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-900 relative">
      {/* Background luxe pattern */}
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml,%3Csvg width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M1 1h2v2H1V1zm4 0h2v2H5V1zm4 0h2v2H9V1zm4 0h2v2h-2V1zm4 0h2v2h-2V1zM1 5h2v2H1V5zm4 0h2v2H5V5zm4 0h2v2H9V5zm4 0h2v2h-2V5zm4 0h2v2h-2V5zM1 9h2v2H1V9zm4 0h2v2H5V9zm4 0h2v2H9V9zm4 0h2v2h-2V9zm4 0h2v2h-2V9zM1 13h2v2H1v-2zm4 0h2v2H5v-2zm4 0h2v2H9v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM1 17h2v2H1v-2zm4 0h2v2H5v-2zm4 0h2v2H9v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z%22 fill=%22%23D4AF37%22 fill-opacity=%221%22 fill-rule=%22evenodd%22/%3E%3C/svg%3E')]" />

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <p className="text-amber-400 text-sm tracking-[0.3em] uppercase mb-4 font-light">
            Bespoke Service
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-6 text-white tracking-tight">
            Custom Jewelry
          </h2>
          <div className="w-16 h-px mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-6" />
          <p className="text-base text-white/50 max-w-xl mx-auto font-light leading-relaxed">
            Bring your vision to life. Our master craftsmen will create a bespoke piece just for you.
          </p>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-8 md:p-12 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500">
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-white/80 font-light text-sm tracking-wide">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  className="bg-neutral-900 border-neutral-800 text-white placeholder:text-white/20 h-12 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-none"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-white/80 font-light text-sm tracking-wide">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  className="bg-neutral-900 border-neutral-800 text-white placeholder:text-white/20 h-12 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-white/80 font-light text-sm tracking-wide">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="bg-neutral-900 border-neutral-800 text-white placeholder:text-white/20 h-12 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-none"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="budget" className="text-white/80 font-light text-sm tracking-wide">
                  Budget Range
                </Label>
                <Select value={formData.budget} onValueChange={handleBudgetChange}>
                  <SelectTrigger className="bg-neutral-900 border-neutral-800 text-white/80 h-12 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-none">
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                    <SelectItem value="under-50" className="focus:bg-amber-500/20 focus:text-white">Under ₹50,000</SelectItem>
                    <SelectItem value="50-100" className="focus:bg-amber-500/20 focus:text-white">₹50,000 - ₹100,000</SelectItem>
                    <SelectItem value="100-250" className="focus:bg-amber-500/20 focus:text-white">₹100,000 - ₹250,000</SelectItem>
                    <SelectItem value="250-500" className="focus:bg-amber-500/20 focus:text-white">₹250,000 - ₹500,000</SelectItem>
                    <SelectItem value="500-plus" className="focus:bg-amber-500/20 focus:text-white">₹500,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-white/80 font-light text-sm tracking-wide">
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
                className="bg-neutral-900 border-neutral-800 text-white placeholder:text-white/20 resize-none focus:border-amber-500/50 focus:ring-amber-500/20 rounded-none"
              />
            </div>

            {status === 'success' && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-white">{message}</p>
              </div>
            )}

            {status === 'error' && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-white">{message}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-medium uppercase tracking-[0.2em] h-14 text-sm transition-all duration-300 rounded-none hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                'Request Custom Consultation'
              )}
            </Button>
          </form>

          {/* Decorative Corner Borders */}
          <div className="absolute top-0 left-0 w-16 h-16 border-l border-t border-amber-500/20" />
          <div className="absolute top-0 right-0 w-16 h-16 border-r border-t border-amber-500/20" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-l border-b border-amber-500/20" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-r border-b border-amber-500/20" />
        </div>
      </div>
    </section>
  )
}
