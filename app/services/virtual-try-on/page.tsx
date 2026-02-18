'use client'

import React, { useState } from "react"
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { submitVirtualTryOn } from '@/app/actions/services'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle, AlertCircle, Monitor, Smartphone, Video, ArrowRight, Camera } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const tryOnSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Valid phone number is required'),
    date: z.string().min(1, 'Preferred date is required'),
    time: z.string().min(1, 'Preferred time is required'),
})

type TryOnValues = z.infer<typeof tryOnSchema>

export default function VirtualTryOnPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<TryOnValues>({
        resolver: zodResolver(tryOnSchema),
        defaultValues: { name: '', email: '', phone: '', date: '', time: '' }
    })

    const onSubmit = async (data: TryOnValues) => {
        setIsLoading(true); setStatus('idle');
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => formData.append(key, value));
            const result = await submitVirtualTryOn(formData);
            if (result.success) {
                setStatus('success');
                setMessage("Your consultation request has been received. Our concierge will contact you shortly.");
                reset();
            } else {
                setStatus('error');
                setMessage(result.error || 'Something went wrong.');
            }
        } catch (err) {
            setStatus('error'); setMessage('Something went wrong.');
        } finally { setIsLoading(false); }
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30">
            <Navbar />

            <main>
                {/* Luxury Hero Section */}
                <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-20 px-6 overflow-hidden">
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(191,155,101,0.05)_0%,_transparent_50%)]" />
                        <motion.div
                            animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.1, 1] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"
                        />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
                    </div>

                    <div className="container max-w-7xl mx-auto relative z-10">
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="space-y-8"
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                    <span className="text-[10px] uppercase tracking-[0.3em] text-primary/80 font-bold">Innovation in Luxury</span>
                                </div>

                                <h1 className="text-6xl md:text-8xl font-serif leading-[1.1] tracking-tighter italic">
                                    The <span className="text-primary not-italic">Mirror</span> of <br />
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-primary/50">Excellence.</span>
                                </h1>

                                <p className="text-xl text-white/50 font-light max-w-lg leading-relaxed">
                                    Bridge the distance between desire and possession. Experience AURERXA's finest
                                    creations virtually, with real-time expert guidance and high-definition clarity.
                                </p>

                                <div className="flex gap-10 pt-4">
                                    <div className="space-y-1">
                                        <p className="text-2xl font-serif text-primary">0%</p>
                                        <p className="text-[10px] uppercase tracking-widest text-white/40">Distance</p>
                                    </div>
                                    <div className="w-px h-12 bg-white/10" />
                                    <div className="space-y-1">
                                        <p className="text-2xl font-serif text-primary">4K</p>
                                        <p className="text-[10px] uppercase tracking-widest text-white/40">Resolution</p>
                                    </div>
                                    <div className="w-px h-12 bg-white/10" />
                                    <div className="space-y-1">
                                        <p className="text-2xl font-serif text-primary">1-on-1</p>
                                        <p className="text-[10px] uppercase tracking-widest text-white/40">Concierge</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className="relative aspect-square lg:aspect-auto h-[600px] group"
                            >
                                <div className="absolute inset-0 border border-primary/20 rounded-2xl rotate-3 group-hover:rotate-1 transition-transform duration-1000" />
                                <div className="absolute inset-0 border border-white/5 rounded-2xl -rotate-3 group-hover:-rotate-1 transition-transform duration-1000" />
                                <div className="relative w-full h-full bg-[#111] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                                    <img
                                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop"
                                        className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-1000"
                                        alt="Virtual Experience"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />

                                    {/* Floating Elements */}
                                    <motion.div
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                        className="absolute top-10 right-10 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl"
                                    >
                                        <Video className="text-primary w-6 h-6" />
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* The Experience Bento Grid */}
                <section className="py-32 px-6">
                    <div className="container max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 group relative h-[500px] rounded-3xl overflow-hidden border border-white/5 bg-white/2 backdrop-blur-sm p-12 flex flex-col justify-end">
                                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,_rgba(191,155,101,0.1)_0%,_transparent_50%)]" />
                                <Camera className="absolute top-12 left-12 text-primary/20 w-32 h-32 -rotate-12 group-hover:rotate-0 transition-transform duration-700" strokeWidth={0.5} />
                                <div className="relative z-10 space-y-4">
                                    <h3 className="text-4xl font-serif italic text-primary">Immersive Clarity</h3>
                                    <p className="text-white/50 max-w-md font-light">
                                        Every facet, every reflection, every detail. Our high-definition virtual session ensures you see our jewelry as if it were in your own hands.
                                    </p>
                                </div>
                            </div>

                            <div className="group relative rounded-3xl overflow-hidden border border-white/5 bg-[#0a0a0a] p-12 flex flex-col gap-8 transition-all hover:bg-white/5">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Smartphone className="text-primary" size={24} />
                                </div>
                                <div className="space-y-4 mt-auto">
                                    <h3 className="text-2xl font-serif">Seamless Mobility</h3>
                                    <p className="text-sm text-white/40 font-light leading-relaxed">
                                        Accessible on any device. Your private consultation travels with you, wherever you are in the world.
                                    </p>
                                </div>
                            </div>

                            <div className="group relative rounded-3xl overflow-hidden border border-white/5 bg-[#111] p-12 flex flex-col gap-8">
                                <Monitor className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 w-48 h-48" strokeWidth={0.5} />
                                <div className="relative z-10 space-y-4 mt-auto">
                                    <h3 className="text-2xl font-serif">Real-time Styling</h3>
                                    <p className="text-sm text-white/40 font-light leading-relaxed">
                                        Compare pieces side-by-side. Get instant styling advice from our experts based on your skin tone and occasion.
                                    </p>
                                </div>
                            </div>

                            <div className="md:col-span-2 group relative h-[400px] rounded-3xl overflow-hidden bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-white/5 p-12 flex items-center justify-between">
                                <div className="space-y-6 max-w-sm">
                                    <h3 className="text-3xl font-serif italic">Global Concierge</h3>
                                    <p className="text-white/50 font-light">
                                        Our advisors speak the language of luxury. Book a session with specialists who understand global trends and heritage craftsmanship.
                                    </p>
                                </div>
                                <div className="hidden md:block w-px h-32 bg-primary/20" />
                                <div className="hidden md:flex flex-col gap-4 italic font-serif text-2xl text-primary/40">
                                    <span>Paris</span>
                                    <span>New York</span>
                                    <span>London</span>
                                    <span>Mumbai</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Booking Form - The Signature Component */}
                <section className="py-32 px-6 relative">
                    <div className="container max-w-2xl mx-auto">
                        <div className="text-center mb-16 space-y-4">
                            <h2 className="text-5xl font-serif">Request an Invitation</h2>
                            <p className="text-white/40 font-light italic">Your journey with AURERXA begins here.</p>
                        </div>

                        <div className="bg-[#0a0a0a] border border-white/10 p-12 rounded-[2rem] relative overflow-hidden group shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors" />

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1">Full Name</Label>
                                        <Input
                                            {...register('name')}
                                            placeholder="Enter your name"
                                            className="bg-transparent border-0 border-b border-white/10 rounded-none h-12 focus-visible:ring-0 focus:border-primary transition-colors placeholder:text-white/10"
                                        />
                                        {errors.name && <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold">{errors.name.message}</p>}
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1">Email Address</Label>
                                        <Input
                                            {...register('email')}
                                            type="email"
                                            placeholder="noble@example.com"
                                            className="bg-transparent border-0 border-b border-white/10 rounded-none h-12 focus-visible:ring-0 focus:border-primary transition-colors placeholder:text-white/10"
                                        />
                                        {errors.email && <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold">{errors.email.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1">Phone Number</Label>
                                    <Input
                                        {...register('phone')}
                                        type="tel"
                                        placeholder="+91 ...."
                                        className="bg-transparent border-0 border-b border-white/10 rounded-none h-12 focus-visible:ring-0 focus:border-primary transition-colors placeholder:text-white/10"
                                    />
                                    {errors.phone && <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold">{errors.phone.message}</p>}
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1">Preferred Date</Label>
                                        <Input
                                            type="date"
                                            {...register('date')}
                                            className="bg-transparent border-0 border-b border-white/10 rounded-none h-12 focus-visible:ring-0 focus:border-primary transition-colors [color-scheme:dark]"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1">Preferred Time</Label>
                                        <Input
                                            type="time"
                                            {...register('time')}
                                            className="bg-transparent border-0 border-b border-white/10 rounded-none h-12 focus-visible:ring-0 focus:border-primary transition-colors [color-scheme:dark]"
                                        />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {status === 'success' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 bg-primary/10 border border-primary/20 text-primary flex items-center gap-3 rounded-xl"
                                        >
                                            <CheckCircle size={18} />
                                            <p className="text-xs uppercase tracking-widest font-medium">{message}</p>
                                        </motion.div>
                                    )}
                                    {status === 'error' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3 rounded-xl"
                                        >
                                            <AlertCircle size={18} />
                                            <p className="text-xs uppercase tracking-widest font-medium">{message}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <Button
                                    disabled={isLoading}
                                    className="w-full bg-primary hover:bg-primary/90 text-black font-bold uppercase tracking-[0.4em] h-16 rounded-full transition-all duration-500 group shadow-[0_0_20px_rgba(191,155,101,0.2)]"
                                >
                                    {isLoading ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        <span className="flex items-center gap-3">
                                            Secure a Session <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
