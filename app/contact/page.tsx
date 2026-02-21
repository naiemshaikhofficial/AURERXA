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
import { cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(2, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactValues = z.infer<typeof contactSchema>

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    }
  })

  const onSubmit = async (data: ContactValues) => {
    setIsLoading(true)
    setStatus('idle')

    try {
      const result = await submitContact(data)

      if (result.success) {
        setStatus('success')
        setMessage(result.message!)
        reset()
      } else {
        setStatus('error')
        setMessage(result.error!)
        const { logError } = await import('@/lib/logger')
        await logError(new Error(result.error), { metadata: { form: 'ContactPage' } })
      }
    } catch (err: any) {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
      const { logError } = await import('@/lib/logger')
      await logError(err, { metadata: { form: 'ContactPage' } })
    } finally {
      setIsLoading(false)
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-background/90 z-0" />
        <ParallaxScroll offset={50} direction="up" className="max-w-7xl mx-auto text-center relative z-10">
          <p className="text-primary text-sm tracking-[0.3em] uppercase mb-4 font-light">
            Get in Touch
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold text-foreground mb-6 tracking-tight">
            Contact Us
          </h1>
          <div className="w-16 h-px mx-auto bg-gradient-to-r from-transparent via-primary to-transparent mb-6" />
          <p className="text-base text-muted-foreground max-w-xl mx-auto font-light">
            Get in touch with our team for any inquiries or assistance
          </p>
        </ParallaxScroll>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div className="p-6 bg-card border border-border">
                <h3 className="text-lg font-serif font-medium mb-3 text-foreground flex items-center gap-3">
                  <Mail className="text-primary" size={20} />
                  Email
                </h3>
                <p className="text-muted-foreground font-light">aurerxa@gmail.com</p>
                <p className="text-sm text-muted-foreground/60 mt-1 font-light">
                  We respond to all inquiries within 24 hours
                </p>
              </div>

              <div className="p-6 bg-card border border-border">
                <h3 className="text-lg font-serif font-medium mb-3 text-foreground flex items-center gap-3">
                  <Phone className="text-primary" size={20} />
                  Phone
                </h3>
                <p className="text-muted-foreground font-light">+91 95790 42043</p>
                <p className="text-sm text-muted-foreground/60 mt-1 font-light">
                  Monday - Saturday, 10 AM - 6 PM IST
                </p>
              </div>

              <div className="p-6 bg-card border border-border">
                <h3 className="text-lg font-serif font-medium mb-3 text-foreground flex items-center gap-3">
                  <MapPin className="text-primary" size={20} />
                  Address
                </h3>
                <p className="text-muted-foreground font-light">
                  nijamuddin shaikh,
                  <br />
                  kolhewadi road, near tajgard
                  <br />
                  sangamner 422605
                </p>
              </div>

              <div className="p-6 bg-card border border-border">
                <h4 className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-4">
                  Business Hours
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground font-light">
                  <li>Monday - Friday: 10 AM - 8 PM</li>
                  <li>Saturday: 10 AM - 6 PM</li>
                  <li>Sunday: 12 PM - 5 PM</li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 border border-border p-8 bg-card">
              <h2 className="text-2xl font-serif font-bold mb-8 text-foreground">Send us a Message</h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground/80 font-light text-sm">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="Your name"
                      className={cn(
                        "bg-background/50 border-input text-foreground placeholder:text-muted-foreground/50 h-14 focus:border-primary/50 rounded-none transition-colors",
                        errors.name && "border-destructive/50"
                      )}
                    />
                    {errors.name && <p className="text-[10px] text-destructive uppercase tracking-widest font-bold">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground/80 font-light text-sm">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="your@email.com"
                      className={cn(
                        "bg-background/50 border-input text-foreground placeholder:text-muted-foreground/50 h-14 focus:border-primary/50 rounded-none transition-colors",
                        errors.email && "border-destructive/50"
                      )}
                    />
                    {errors.email && <p className="text-[10px] text-destructive uppercase tracking-widest font-bold">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-foreground/80 font-light text-sm">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    {...register('subject')}
                    placeholder="What is this about?"
                    className={cn(
                      "bg-background/50 border-input text-foreground placeholder:text-muted-foreground/50 h-14 focus:border-primary/50 rounded-none transition-colors",
                      errors.subject && "border-destructive/50"
                    )}
                  />
                  {errors.subject && <p className="text-[10px] text-destructive uppercase tracking-widest font-bold">{errors.subject.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-foreground/80 font-light text-sm">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    {...register('message')}
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    className={cn(
                      "bg-background/50 border-input text-foreground placeholder:text-muted-foreground/50 resize-none focus:border-primary/50 rounded-none transition-colors",
                      errors.message && "border-destructive/50"
                    )}
                  />
                  {errors.message && <p className="text-[10px] text-destructive uppercase tracking-widest font-bold">{errors.message.message}</p>}
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
                  className="w-full bg-foreground hover:bg-foreground/90 text-background font-bold uppercase tracking-[0.2em] h-14 rounded-none transition-all duration-300 mt-4"
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
