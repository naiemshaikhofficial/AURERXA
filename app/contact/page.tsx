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
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-secondary to-background">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold text-accent mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-muted-foreground">
            Get in touch with our team for any inquiries or assistance
          </p>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h3 className="text-xl font-serif font-semibold mb-4 text-foreground flex items-center gap-3">
                  <Mail className="text-accent" size={24} />
                  Email
                </h3>
                <p className="text-muted-foreground">hello@aurerxa.com</p>
                <p className="text-sm text-muted-foreground mt-1">
                  We respond to all inquiries within 24 hours
                </p>
              </div>

              <div>
                <h3 className="text-xl font-serif font-semibold mb-4 text-foreground flex items-center gap-3">
                  <Phone className="text-accent" size={24} />
                  Phone
                </h3>
                <p className="text-muted-foreground">+1 (555) 123-4567</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Monday - Saturday, 10 AM - 6 PM EST
                </p>
              </div>

              <div>
                <h3 className="text-xl font-serif font-semibold mb-4 text-foreground flex items-center gap-3">
                  <MapPin className="text-accent" size={24} />
                  Address
                </h3>
                <p className="text-muted-foreground">
                  AURERXA Flagship Boutique
                  <br />
                  Madison Avenue
                  <br />
                  New York, NY 10065
                </p>
              </div>

              <div className="pt-8 border-t border-border">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground mb-4">
                  Business Hours
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Monday - Friday: 10 AM - 8 PM</li>
                  <li>Saturday: 10 AM - 6 PM</li>
                  <li>Sunday: 12 PM - 5 PM</li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 border border-border rounded-sm p-8 bg-secondary/20">
              <h2 className="text-3xl font-serif font-bold mb-8 text-accent">Send us a Message</h2>

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
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-foreground font-semibold">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this about?"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-foreground font-semibold">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your inquiry..."
                    required
                    rows={8}
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
                  className="w-full bg-accent hover:bg-accent/90 text-primary font-semibold uppercase tracking-widest h-12"
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
