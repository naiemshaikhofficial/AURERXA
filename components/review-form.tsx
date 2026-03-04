'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Star, Camera, X, Loader2, ArrowLeft, ImageIcon } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { uploadReviewImage, submitReview } from '@/app/actions'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

interface ReviewFormProps {
    productId: string
    onSuccess?: () => void
    isOpen: boolean
    onClose: () => void
}

const STEPS = ['rate', 'photos', 'comment', 'info'] as const
type Step = typeof STEPS[number]

export function ReviewForm({ productId, onSuccess, isOpen, onClose }: ReviewFormProps) {
    const [currentStep, setCurrentStep] = useState<Step>('rate')
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploadingImages, setUploadingImages] = useState(false)
    const [images, setImages] = useState<string[]>([])
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Auto-fill for logged in users
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                setIsLoggedIn(true)
                const user = session.user
                setEmail(user.email || '')

                // Fetch profile for full name
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single()

                if (profile?.full_name) {
                    const parts = profile.full_name.trim().split(/\s+/)
                    setFirstName(parts[0] || '')
                    setLastName(parts.length > 1 ? parts.slice(1).join(' ') : '')
                }
            }
        }
        if (isOpen) {
            fetchUser()
        }
    }, [isOpen])

    const stepIndex = STEPS.indexOf(currentStep)

    const ratingLabels = ['', 'Terrible', 'Poor', 'Average', 'Good', 'Love it!']

    const resetForm = () => {
        setCurrentStep('rate')
        setRating(0)
        setHoverRating(0)
        setComment('')
        setFirstName('')
        setLastName('')
        setEmail('')
        setImages([])
        setIsSubmitting(false)
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploadingImages(true)
        const newImages: string[] = []

        for (let i = 0; i < Math.min(files.length, 5 - images.length); i++) {
            const file = files[i]
            const options = {
                maxSizeMB: 0.048,
                maxWidthOrHeight: 1200,
                useWebWorker: true,
                fileType: 'image/webp' as const
            }

            try {
                const compressedFile = await imageCompression(file, options)
                const reader = new FileReader()
                const base64Promise = new Promise<string>((resolve) => {
                    reader.onloadend = () => resolve(reader.result as string)
                    reader.readAsDataURL(compressedFile)
                })
                const base64 = await base64Promise
                const result = await uploadReviewImage(base64, productId)

                if (result.success && result.data) {
                    newImages.push(result.data)
                } else {
                    toast.error(`Upload failed: ${result.error}`)
                }
            } catch (error) {
                console.error('Upload error:', error)
                toast.error('Error processing image')
            }
        }

        setImages(prev => [...prev, ...newImages])
        setUploadingImages(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSubmit = async () => {
        if (!firstName.trim() || !email.trim()) {
            toast.error('Please fill in your name and email')
            return
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error('Please enter a valid email')
            return
        }

        setIsSubmitting(true)
        const formData = new FormData()
        formData.append('productId', productId)
        formData.append('rating', rating.toString())
        formData.append('comment', comment)
        formData.append('images', JSON.stringify(images))
        formData.append('firstName', firstName)
        formData.append('lastName', lastName)
        formData.append('email', email)

        const result = await submitReview(formData)

        if (result.success) {
            toast.success('Thank you for your review!')
            handleClose()
            onSuccess?.()
        } else {
            toast.error(result.error || 'Submission failed')
        }
        setIsSubmitting(false)
    }

    const goNext = () => {
        const nextIndex = stepIndex + 1
        if (nextIndex < STEPS.length) {
            setCurrentStep(STEPS[nextIndex])
        }
    }

    const goBack = () => {
        const prevIndex = stepIndex - 1
        if (prevIndex >= 0) {
            setCurrentStep(STEPS[prevIndex])
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative w-full max-w-md bg-neutral-950 border border-white/10 shadow-2xl rounded-xl overflow-hidden"
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content Area */}
                <div className="min-h-[380px] flex flex-col">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Rating */}
                        {currentStep === 'rate' && (
                            <motion.div
                                key="rate"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.2 }}
                                className="flex-1 flex flex-col items-center justify-center px-8 py-12"
                            >
                                <h3 className="text-sm font-bold text-white/40 uppercase tracking-[0.3em] mb-12">
                                    How would you rate this item?
                                </h3>
                                <div className="flex gap-2 mb-10 relative">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <motion.button
                                            key={s}
                                            type="button"
                                            initial={{ scale: 0, opacity: 0, rotate: -45 }}
                                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 600,
                                                damping: 25,
                                                delay: s * 0.05
                                            }}
                                            whileHover={{ scale: 1.1, zIndex: 10 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setRating(s)}
                                            onMouseEnter={() => setHoverRating(s)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="relative w-16 h-16 flex items-center justify-center outline-none group"
                                        >
                                            {/* Extreme Mechanical Layers */}
                                            {[...Array(3)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                                    animate={{
                                                        rotate: (hoverRating || rating) >= s ? (i + 1) * 360 : i * 45,
                                                        scale: (hoverRating || rating) >= s ? 1 - (i * 0.1) : 0.8,
                                                        opacity: (hoverRating || rating) >= s ? 1 : 0.1 + (i * 0.1),
                                                    }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 400 - (i * 50),
                                                        damping: 20 + (i * 5),
                                                        mass: 1 + (i * 0.2)
                                                    }}
                                                >
                                                    <Star
                                                        className={`w-12 h-12 ${(hoverRating || rating) >= s
                                                                ? 'text-white fill-white'
                                                                : 'text-white/20 stroke-[0.5]'
                                                            }`}
                                                        style={{
                                                            filter: (hoverRating || rating) >= s ? 'brightness(1.5)' : 'none',
                                                            transform: `scale(${1 - (i * 0.15)})`
                                                        }}
                                                    />
                                                </motion.div>
                                            ))}

                                            {/* Mechanical Shutter Lines */}
                                            {(hoverRating || rating) >= s && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.5 }}
                                                    animate={{ opacity: 1, scale: 1.2 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute inset-0 border-[0.5px] border-white/30 rounded-full scale-110 pointer-events-none"
                                                />
                                            )}
                                        </motion.button>
                                    ))}

                                    {/* Moving Mechanical Chassis - Unique Indicator */}
                                    {rating > 0 && (
                                        <motion.div
                                            layoutId="chassis"
                                            className="absolute -bottom-4 h-[2px] bg-white w-16 rounded-full"
                                            initial={false}
                                            animate={{
                                                x: (rating - 1) * 72, // w-16(64px) + gap-2(8px) = 72px
                                                opacity: 1
                                            }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </div>
                                <div className="flex justify-between w-full max-w-[320px] items-center mt-4">
                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Dislike it</span>
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={hoverRating || rating}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="text-xs font-bold text-white uppercase tracking-[0.4em] drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                                        >
                                            {ratingLabels[hoverRating || rating] || 'Select Rating'}
                                        </motion.span>
                                    </AnimatePresence>
                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Love it!</span>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Photos */}
                        {currentStep === 'photos' && (
                            <motion.div
                                key="photos"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.2 }}
                                className="flex-1 flex flex-col items-center justify-center px-8 py-12"
                            >
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Show it off
                                </h3>
                                <p className="text-sm text-white/40 mb-8 text-center">
                                    We'd love to see it in action!
                                </p>

                                {/* Uploaded previews */}
                                {images.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mb-6 justify-center">
                                        {images.map((img, idx) => (
                                            <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                                                <img src={img} alt="review" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                                                    className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingImages || images.length >= 5}
                                    className="w-full max-w-xs flex items-center justify-center gap-3 py-3.5 border border-white/15 rounded-lg text-white/80 hover:bg-white/5 transition-all disabled:opacity-40 mb-3"
                                >
                                    {uploadingImages ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <ImageIcon className="w-5 h-5" />
                                    )}
                                    <span className="text-sm font-medium">Add photos</span>
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <p className="text-[11px] text-white/20 mt-2">Up to 5 photos • Compressed automatically</p>
                            </motion.div>
                        )}

                        {/* Step 3: Comment */}
                        {currentStep === 'comment' && (
                            <motion.div
                                key="comment"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.2 }}
                                className="flex-1 flex flex-col items-center px-8 py-12"
                            >
                                <h3 className="text-lg font-semibold text-white mb-6">
                                    Tell us more!
                                </h3>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Share your experience"
                                    className="w-full min-h-[140px] bg-transparent border border-white/15 rounded-lg text-white/90 px-4 py-3 text-sm focus:outline-none focus:border-white/30 placeholder:text-white/20 transition-all resize-none leading-relaxed"
                                />
                            </motion.div>
                        )}

                        {/* Step 4: About You */}
                        {currentStep === 'info' && (
                            <motion.div
                                key="info"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.2 }}
                                className="flex-1 flex flex-col px-8 py-12"
                            >
                                <h3 className="text-lg font-semibold text-white mb-6 text-center">
                                    About you
                                </h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-medium text-white/60 mb-1.5 block">
                                                First name <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={firstName}
                                                readOnly={isLoggedIn}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className={`w-full bg-transparent border border-white/15 rounded-lg text-white/90 px-3 py-2.5 text-sm focus:outline-none focus:border-white/30 placeholder:text-white/20 transition-all ${isLoggedIn ? 'opacity-60 cursor-not-allowed' : ''}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-white/60 mb-1.5 block">
                                                Last name
                                            </label>
                                            <input
                                                type="text"
                                                value={lastName}
                                                readOnly={isLoggedIn}
                                                onChange={(e) => setLastName(e.target.value)}
                                                className={`w-full bg-transparent border border-white/15 rounded-lg text-white/90 px-3 py-2.5 text-sm focus:outline-none focus:border-white/30 placeholder:text-white/20 transition-all ${isLoggedIn ? 'opacity-60 cursor-not-allowed' : ''}`}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-white/60 mb-1.5 block">
                                            Email <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            readOnly={isLoggedIn}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className={`w-full bg-transparent border border-white/15 rounded-lg text-white/90 px-3 py-2.5 text-sm focus:outline-none focus:border-white/30 placeholder:text-white/20 transition-all ${isLoggedIn ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        />
                                    </div>
                                    <p className="text-[11px] text-white/30 text-center leading-relaxed pt-2">
                                        By submitting, I acknowledge the{' '}
                                        <a href="/terms" className="underline hover:text-white/50">Terms of Service</a>
                                        {' '}and{' '}
                                        <a href="/privacy" className="underline hover:text-white/50">Privacy Policy</a>
                                        {' '}and that my review will be publicly posted.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom Navigation */}
                <div className="px-8 py-5 border-t border-white/5 flex items-center justify-between">
                    {/* Back Button */}
                    <div>
                        {stepIndex > 0 && (
                            <button
                                onClick={goBack}
                                className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back</span>
                            </button>
                        )}
                    </div>

                    {/* Progress Dots */}
                    <div className="flex gap-2">
                        {STEPS.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1 rounded-full transition-all duration-300 ${idx <= stepIndex
                                    ? 'w-8 bg-white'
                                    : 'w-8 bg-white/10'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Next / Skip / Done */}
                    <div>
                        {currentStep === 'rate' && (
                            <button
                                onClick={goNext}
                                disabled={rating === 0}
                                className="px-5 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-white/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        )}
                        {currentStep === 'photos' && (
                            <button
                                onClick={goNext}
                                disabled={uploadingImages}
                                className="text-sm text-white/50 hover:text-white transition-colors"
                            >
                                {images.length > 0 ? 'Next' : 'Skip'}
                            </button>
                        )}
                        {currentStep === 'comment' && (
                            <button
                                onClick={goNext}
                                className="px-5 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-white/90 transition-all"
                            >
                                Next
                            </button>
                        )}
                        {currentStep === 'info' && (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !firstName.trim() || !email.trim()}
                                className="px-5 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-white/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Done
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
