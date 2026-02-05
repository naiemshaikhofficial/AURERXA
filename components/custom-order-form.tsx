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
    <section id="custom" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4 text-accent">
            Custom Jewelry
          </h2>
          <p className="text-lg text-muted-foreground">
            Bring your vision to life. Our master craftsmen will create a bespoke piece just for you.
          </p>
        </div>

        <div className="border border-border rounded-sm p-8 bg-secondary/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground font-semibold">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-semibold">
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
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground font-semibold">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget" className="text-foreground font-semibold">
                  Budget Range
                </Label>
                <Select value={formData.budget} onValueChange={handleBudgetChange}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-50">Under ₹50,000</SelectItem>
                    <SelectItem value="50-100">₹50,000 - ₹100,000</SelectItem>
                    <SelectItem value="100-250">₹100,000 - ₹250,000</SelectItem>
                    <SelectItem value="250-500">₹250,000 - ₹500,000</SelectItem>
                    <SelectItem value="500-plus">₹500,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground font-semibold">
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
                className="bg-background border-border text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>

            {status === 'success' && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-sm flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground">{message}</p>
              </div>
            )}

            {status === 'error' && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-sm flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground">{message}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold uppercase tracking-widest h-12"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Request Custom Piece'
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
