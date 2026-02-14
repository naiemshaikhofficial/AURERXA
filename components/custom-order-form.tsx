'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { submitCustomOrder } from '@/app/actions'
import { uploadToSupabase } from '@/lib/storage'
import imageCompression from 'browser-image-compression'
import { Loader2, CheckCircle, AlertCircle, X, Camera } from 'lucide-react'

export function CustomOrderForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [mounted, setMounted] = useState(false)

  // Image states
  const [selectedImages, setSelectedImages] = useState<{ file: File; preview: string }[]>([])
  const [isCatalogRequested, setIsCatalogRequested] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleBudgetChange = (value: string) => {
    setFormData(prev => ({ ...prev, budget: value }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const remainingSlots = 3 - selectedImages.length
      const newFiles = files.slice(0, remainingSlots)

      const newImages = newFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }))

      setSelectedImages(prev => [...prev, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => {
      const newImages = [...prev]
      URL.revokeObjectURL(newImages[index].preview)
      newImages.splice(index, 1)
      return newImages
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus('idle')

    try {
      // 1. Process and Upload Images
      const imageUrls: string[] = []

      for (const item of selectedImages) {
        // Compress image
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        }

        try {
          const compressedFile = await imageCompression(item.file, options)
          // Upload to Supabase (using 'custom_designs' bucket)
          const uploadResult = await uploadToSupabase(compressedFile, 'custom_designs')

          if (uploadResult.success && uploadResult.url) {
            imageUrls.push(uploadResult.url)
          }
        } catch (compressError) {
          console.error('Compression/Upload error:', compressError)
        }
      }

      // 2. Submit Order
      const finalData = {
        ...formData,
        images: imageUrls,
        catalog_requested: isCatalogRequested
      }

      const result = await submitCustomOrder(finalData)

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
        setSelectedImages([])
        setIsCatalogRequested(false)
      } else {
        setStatus('error')
        setMessage(result.error!)
      }
    } catch (err: any) {
      console.error('Submit Error:', err)
      setStatus('error')
      setMessage('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  return (
    <section ref={sectionRef} id="custom" className="py-16 md:py-32 px-6 lg:px-12 bg-background relative overflow-hidden transition-colors duration-500">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mx-auto relative z-10"
      >
        <div className="text-center mb-16 md:mb-24">
          <p className="text-primary/80 text-[10px] font-premium-sans mb-6">
            Bespoke Service
          </p>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-serif font-light mb-8 text-foreground tracking-widest italic">
            Custom <span className="text-primary">Jewelry</span>
          </h2>
          <div className="w-24 h-[1px] mx-auto bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-8" />
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto font-light leading-relaxed tracking-widest italic">
            Bring your vision to life. Our master craftsmen will create a bespoke piece just for you.
          </p>
        </div>

        <div className="bg-card border border-border p-6 md:p-16 relative overflow-hidden group hover:border-primary/20 transition-all duration-1000 shadow-[0_0_50px_rgba(0,0,0,0.2)] dark:shadow-[0_0_50px_rgba(0,0,0,1)]">
          <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <Label htmlFor="name" className="text-muted-foreground text-[9px] font-premium-sans">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your illustrious name"
                  required
                  className="bg-background/40 border-border text-foreground placeholder:text-muted-foreground/30 h-14 focus:border-primary/30 focus:ring-0 rounded-none text-xs tracking-widest"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="email" className="text-muted-foreground text-[9px] font-premium-sans">
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
                  className="bg-background/40 border-border text-foreground placeholder:text-muted-foreground/30 h-14 focus:border-primary/30 focus:ring-0 rounded-none text-xs tracking-widest"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <Label htmlFor="phone" className="text-muted-foreground text-[9px] font-premium-sans">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 (000) 000-0000"
                  className="bg-background/40 border-border text-foreground placeholder:text-muted-foreground/30 h-14 focus:border-primary/30 focus:ring-0 rounded-none text-xs tracking-widest"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="budget" className="text-muted-foreground text-[9px] font-premium-sans">
                  Budget Range
                </Label>
                {mounted && (
                  <Select value={formData.budget} onValueChange={handleBudgetChange}>
                    <SelectTrigger className="bg-background/40 border-border text-muted-foreground h-14 focus:border-primary/30 focus:ring-0 rounded-none text-xs tracking-widest">
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground rounded-none">
                      <SelectItem value="under-50" className="focus:bg-accent focus:text-accent-foreground py-3">Under ₹50,000</SelectItem>
                      <SelectItem value="50-100" className="focus:bg-accent focus:text-accent-foreground py-3">₹50,000 - ₹100,000</SelectItem>
                      <SelectItem value="100-250" className="focus:bg-accent focus:text-accent-foreground py-3">₹100,000 - ₹250,000</SelectItem>
                      <SelectItem value="250-500" className="focus:bg-accent focus:text-accent-foreground py-3">₹250,000 - ₹500,000</SelectItem>
                      <SelectItem value="500-plus" className="focus:bg-accent focus:text-accent-foreground py-3">₹500,000+</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <Label className="text-muted-foreground text-[9px] font-premium-sans uppercase tracking-[0.2em]">
                Design Inspo (Max 3)
              </Label>
              <div className="grid grid-cols-3 gap-4">
                {selectedImages.map((img, idx) => (
                  <div key={idx} className="aspect-square relative group overflow-hidden border border-border bg-muted/20">
                    <img src={img.preview} alt="preview" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 bg-black/60 text-white p-1 hover:bg-primary transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {selectedImages.length < 3 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                  >
                    <Camera className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors stroke-1" />
                    <span className="text-[8px] uppercase tracking-tighter text-muted-foreground/60">Upload</span>
                  </button>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                multiple
                className="hidden"
              />
            </div>

            <div className="space-y-4">
              <Label htmlFor="description" className="text-muted-foreground text-[9px] font-premium-sans">
                Describe Your Dream Piece
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell us about your design, materials, and inspiration..."
                required
                rows={4}
                className="bg-background/40 border-border text-foreground placeholder:text-muted-foreground/30 resize-none focus:border-primary/30 focus:ring-0 rounded-none text-xs tracking-widest leading-loose"
              />
            </div>

            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setIsCatalogRequested(!isCatalogRequested)}>
              <div className={`w-4 h-4 border border-border flex items-center justify-center transition-all ${isCatalogRequested ? 'bg-primary border-primary' : 'bg-transparent'}`}>
                {isCatalogRequested && <CheckCircle size={10} className="text-white" />}
              </div>
              <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors uppercase tracking-widest font-light">
                I would also like to receive the AURERXA catalog
              </span>
            </div>

            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="alert-luxury-success text-center"
              >
                <CheckCircle size={20} className="mx-auto mb-4 text-emerald-500" />
                <p>{message}</p>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="alert-luxury-error text-center"
              >
                <AlertCircle size={20} className="mx-auto mb-4 text-destructive" />
                <p>{message}</p>
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-foreground text-background hover:bg-primary hover:text-primary-foreground font-bold uppercase tracking-[0.4em] h-16 text-[10px] transition-all duration-700 rounded-none shadow-2xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Processing...
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

