'use client'

import React, { useState } from "react"
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { submitBoutiqueVisit } from '@/app/actions/services'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle, AlertCircle, Store, Coffee, UserCheck, Calendar, ArrowRight, MapPin, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const visitSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Valid phone number is required'),
    date: z.string().min(1, 'Preferred date is required'),
    time: z.string().min(1, 'Preferred time is required'),
    purpose: z.string().optional(),
})

type VisitValues = z.infer<typeof visitSchema>

export default function PersonalizedVisitPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const { register, handleSubmit, formState: { errors }, reset } = useForm<VisitValues>({
        resolver: zodResolver(visitSchema),
        defaultValues: { name: '', email: '', phone: '', date: '', time: '', purpose: '' }
    })

    const onSubmit = async (data: VisitValues) => {
        setIsLoading(true); setStatus('idle');
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => formData.append(key, value));
            const result = await submitBoutiqueVisit(formData);
            if (result.success) {
                setStatus('success');
                setMessage("Your personalized boutique visit has been scheduled. We look forward to welcoming you.");
                reset();
            } else {
                setStatus('error'); setMessage(result.error || 'Something went wrong.');
            }
        } catch (err) {
            setStatus('error'); setMessage('Something went wrong.');
        } finally { setIsLoading(false); }
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30">
            <Navbar />

            <main>
                {/* Boutique Ambiance Hero */}
                <section className="relative h-[100vh] flex items-center justify-center pt-20 overflow-hidden">
                    <div className="absolute inset-0">
                        <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover opacity-20 grayscale scale-110" alt="Boutique" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
                    </div>

                    <div className="container max-w-7xl mx-auto relative z-10 px-6">
                        <div className="max-w-3xl space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-4 text-primary">
                                    <Star size={16} fill="currentColor" />
                                    <span className="text-[10px] uppercase tracking-[0.5em] font-bold">The Flagship Experience</span>
                                    <Star size={16} fill="currentColor" />
                                </div>
                                <h1 className="text-7xl md:text-9xl font-serif leading-[0.9] tracking-tighter italic">
                                    Bespoke <br />
                                    <span className="not-italic text-primary">Ambiance.</span>
                                </h1>
                                <p className="text-2xl font-light text-white/50 max-w-2xl leading-relaxed">
                                    Enter a sanctuary of luxury. Our flagship boutique is designed to
                                    provide the privacy and comfort you deserve as you discover your next masterpiece.
                                </p>
                                <div className="flex gap-8 pt-6">
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-serif text-primary">100%</span>
                                        <span className="text-[10px] uppercase tracking-widest text-white/30">Private Consultation</span>
                                    </div>
                                    <div className="w-px h-12 bg-white/10" />
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-serif text-primary">VIP</span>
                                        <span className="text-[10px] uppercase tracking-widest text-white/30">Hospitality Access</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
                    >
                        <div className="w-px h-24 bg-gradient-to-b from-primary/50 to-transparent" />
                        <span className="text-[10px] uppercase tracking-[0.4em] text-white/20 italic">Scroll for Experience</span>
                    </motion.div>
                </section>

                {/* Features Split Section */}
                <section className="py-32 px-6">
                    <div className="container max-w-7xl mx-auto grid md:grid-cols-2 gap-32 items-center">
                        <div className="space-y-12 order-2 md:order-1">
                            <div className="flex gap-10 items-start group">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-black transition-all">
                                    <UserCheck size={24} strokeWidth={1} />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-serif italic">Dedicated Stylist</h3>
                                    <p className="text-white/40 font-light leading-relaxed">Experience a curated selection guided by a specialist who understands your unique style profile and preferences.</p>
                                </div>
                            </div>

                            <div className="flex gap-10 items-start group">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-black transition-all">
                                    <Coffee size={24} strokeWidth={1} />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-serif italic">Private Salon</h3>
                                    <h3 className="text-2xl font-serif italic">Private Salon</h3>
                                    <p className="text-white/40 font-light leading-relaxed">Browse our most exclusive high-jewelry collections in the comfort of our private VIP consultation suites.</p>
                                </div>
                            </div>

                            <div className="flex gap-10 items-start group">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-black transition-all">
                                    <MapPin size={24} strokeWidth={1} />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-serif italic">Global Locations</h3>
                                    <p className="text-white/40 font-light leading-relaxed">Book a visit at any of our flagship boutiques in major global luxury capitals.</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative aspect-[4/5] order-1 md:order-2">
                            <div className="absolute inset-0 border border-primary/20 -translate-x-6 translate-y-6 rounded-[2rem]" />
                            <div className="relative h-full w-full rounded-[2rem] overflow-hidden border border-white/10">
                                <img src="https://images.unsplash.com/photo-1590736934306-0373f789e907?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover" alt="Boutique Detail" />
                                <div className="absolute inset-x-0 bottom-0 p-12 bg-gradient-to-t from-black to-transparent">
                                    <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold mb-2">Heritage Hall</p>
                                    <p className="text-3xl font-serif italic">The AURERXA Boutique</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Ultra-Premium Booking Form */}
                <section className="py-48 px-6 bg-gradient-to-b from-transparent to-[#0a0a0a]">
                    <div className="container max-w-4xl mx-auto">
                        <div className="text-center mb-24 space-y-6">
                            <h2 className="text-6xl font-serif">Secure an <span className="text-primary italic">Appointment</span></h2>
                            <div className="w-24 h-px bg-primary/30 mx-auto" />
                            <p className="text-white/30 font-light tracking-widest uppercase text-xs">A Tailored Experience Awaits</p>
                        </div>

                        <div className="bg-[#111] border border-white/5 p-16 rounded-[4rem] shadow-3xl">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
                                <div className="grid md:grid-cols-2 gap-12">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold">Your Full Name</Label>
                                        <Input
                                            {...register('name')}
                                            placeholder="Enter name"
                                            className="bg-transparent border-0 border-b border-white/10 rounded-none h-14 focus-visible:ring-0 focus:border-primary transition-colors text-xl font-light"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold">Contact Email</Label>
                                        <Input
                                            {...register('email')}
                                            type="email"
                                            placeholder="your@email.com"
                                            className="bg-transparent border-0 border-b border-white/10 rounded-none h-14 focus-visible:ring-0 focus:border-primary transition-colors text-xl font-light"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-12">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold">Phone</Label>
                                        <Input
                                            {...register('phone')}
                                            type="tel"
                                            placeholder="+91 ..."
                                            className="bg-transparent border-0 border-b border-white/10 rounded-none h-14 focus-visible:ring-0 focus:border-primary transition-colors font-light"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold">Date</Label>
                                        <Input
                                            type="date"
                                            {...register('date')}
                                            className="bg-transparent border-0 border-b border-white/10 rounded-none h-14 focus-visible:ring-0 focus:border-primary transition-colors [color-scheme:dark]"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold">Time</Label>
                                        <Input
                                            type="time"
                                            {...register('time')}
                                            className="bg-transparent border-0 border-b border-white/10 rounded-none h-14 focus-visible:ring-0 focus:border-primary transition-colors [color-scheme:dark]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold">Areas of Interest (Purpose)</Label>
                                    <Textarea
                                        {...register('purpose')}
                                        placeholder="e.g. Bridal Selection, Bespoke Creations..."
                                        className="bg-transparent border-0 border-b border-white/10 rounded-none h-24 focus-visible:ring-0 focus:border-primary transition-colors resize-none font-light italic"
                                    />
                                </div>

                                <AnimatePresence>
                                    {status === 'success' && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-primary/10 border border-primary/20 rounded-3xl flex items-center gap-4 text-primary">
                                            <CheckCircle size={24} />
                                            <span className="text-sm uppercase tracking-widest font-bold">{message}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <Button disabled={isLoading} className="w-full bg-primary hover:bg-white hover:text-black text-black font-bold uppercase tracking-[0.5em] h-24 rounded-full transition-all duration-700 shadow-2xl flex items-center justify-center gap-4">
                                    {isLoading ? <Loader2 className="animate-spin" /> : <>Request Invitation <ArrowRight /></>}
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
