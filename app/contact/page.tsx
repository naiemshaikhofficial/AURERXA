'use client'

import React from "react"
import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { submitContact } from '@/app/actions'
import { ParallaxScroll } from '@/components/parallax-scroll'
import { Loader2, CheckCircle, AlertCircle, Mail, Phone, MapPin } from 'lucide-react'

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus('idle')

    const result = await submitContact(formData)

    if (result.success) {
      setStatus('success')
      setMessage(result.message!)
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      })
    } else {
      setStatus('error')
      setMessage(result.error!)
    }

    setIsLoading(false)
    setTimeout(() => setStatus('idle'), 5000)
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 to-neutral-900 z-0" />
        <ParallaxScroll offset={50} direction="up" className="max-w-7xl mx-auto text-center relative z-10">
          <p className="text-amber-400 text-sm tracking-[0.3em] uppercase mb-4 font-light">
            Get in Touch
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold text-white mb-6 tracking-tight">
            Contact Us
          </h1>
          <div className="w-16 h-px mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-6" />
          <p className="text-base text-white/50 max-w-xl mx-auto font-light">
            Get in touch with our team for any inquiries or assistance
          </p>
        </ParallaxScroll>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div className="p-6 bg-neutral-900 border border-neutral-800">
                <h3 className="text-lg font-serif font-medium mb-3 text-white flex items-center gap-3">
                  <Mail className="text-amber-400" size={20} />
                  Email
                </h3>
                <p className="text-white/60 font-light">hello@aurerxa.com</p>
                <p className="text-sm text-white/40 mt-1 font-light">
                  We respond to all inquiries within 24 hours
                </p>
              </div>

              <div className="p-6 bg-neutral-900 border border-neutral-800">
                <h3 className="text-lg font-serif font-medium mb-3 text-white flex items-center gap-3">
                  <Phone className="text-amber-400" size={20} />
                  Phone
                </h3>
                <p className="text-white/60 font-light">+1 (555) 123-4567</p>
                <p className="text-sm text-white/40 mt-1 font-light">
                  Monday - Saturday, 10 AM - 6 PM EST
                </p>
              </div>

              <div className="p-6 bg-neutral-900 border border-neutral-800">
                <h3 className="text-lg font-serif font-medium mb-3 text-white flex items-center gap-3">
                  <MapPin className="text-amber-400" size={20} />
                  Address
                </h3>
                <p className="text-white/60 font-light">
                  AURERXA Flagship Boutique
                  <br />
                  Madison Avenue
                  <br />
                  New York, NY 10065
                </p>
              </div>

              <div className="p-6 bg-neutral-900 border border-neutral-800">
                <h4 className="text-xs font-medium uppercase tracking-[0.2em] text-amber-400 mb-4">
                  Business Hours
                </h4>
                <ul className="space-y-2 text-sm text-white/50 font-light">
                  <li>Monday - Friday: 10 AM - 8 PM</li>
                  <li>Saturday: 10 AM - 6 PM</li>
                  <li>Sunday: 12 PM - 5 PM</li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 border border-neutral-800 p-8 bg-neutral-900">
              <h2 className="text-2xl font-serif font-bold mb-8 text-white">Send us a Message</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white/80 font-light text-sm">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                      className="bg-neutral-950/50 border-white/10 text-white placeholder:text-white/20 h-14 focus:border-amber-500/50 rounded-none transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/80 font-light text-sm">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      required
                      className="bg-neutral-950/50 border-white/10 text-white placeholder:text-white/20 h-14 focus:border-amber-500/50 rounded-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-white/80 font-light text-sm">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this about?"
                    className="bg-neutral-950/50 border-white/10 text-white placeholder:text-white/20 h-14 focus:border-amber-500/50 rounded-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-white/80 font-light text-sm">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your inquiry..."
                    required
                    rows={6}
                    className="bg-neutral-950/50 border-neutral-800 text-white placeholder:text-white/20 resize-none focus:border-amber-500/50 rounded-none transition-colors"
                  />
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
                      <AlertCircle size={14} className="text-red-500" />
                      <p>{message}</p>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white hover:bg-neutral-200 text-neutral-950 font-bold uppercase tracking-[0.2em] h-14 rounded-none transition-all duration-300 mt-4"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
