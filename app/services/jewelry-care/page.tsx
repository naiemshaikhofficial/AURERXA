'use client'

import React, { useState } from "react"
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { submitJewelryCare } from '@/app/actions/services'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle, AlertCircle, Sparkles, Shield, Clock, Heart, ArrowRight, Hammer, Microscope, Wind } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const careSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Valid phone number is required'),
    serviceType: z.string().min(1, 'Service type is required'),
    date: z.string().min(1, 'Preferred date is required'),
})

type CareValues = z.infer<typeof careSchema>

export default function JewelryCarePage() {
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const { register, handleSubmit, control, formState: { errors }, reset } = useForm<CareValues>({
        resolver: zodResolver(careSchema),
        defaultValues: { name: '', email: '', phone: '', serviceType: 'cleaning', date: '' }
    })

    const onSubmit = async (data: CareValues) => {
        setIsLoading(true); setStatus('idle');
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => formData.append(key, value));
            const result = await submitJewelryCare(formData);
            if (result.success) {
                setStatus('success');
                setMessage("Your care service request has been received. Our specialist will confirm your appointment shortly.");
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
                {/* Craftsmanship Hero */}
                <section className="relative pt-32 pb-24 px-6 overflow-hidden">
                    <div className="absolute inset-0">
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
                    </div>

                    <div className="container max-w-7xl mx-auto relative z-10">
                        <div className="flex flex-col md:flex-row gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="flex-1 space-y-8"
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-primary/80 font-bold">The Art of Preservation</span>
                                </div>
                                <h1 className="text-6xl md:text-8xl font-serif leading-[1.1] tracking-tighter">
                                    Eternal <br />
                                    <span className="italic text-primary">Brilliance.</span>
                                </h1>
                                <p className="text-xl text-white/40 font-light max-w-lg leading-relaxed">
                                    Jewelry is a memory made material. Our master craftsmen ensure your
                                    AURERXA pieces retain their soul and sparkle through expert professional care.
                                </p>
                                <div className="flex gap-4">
                                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Shield size={20} strokeWidth={1.5} />
                                        </div>
                                        <span className="text-xs uppercase tracking-[0.1em] text-white/60 font-medium leading-tight">Lifetime <br />Warranty Support</span>
                                    </div>
                                </div>
                            </motion.div>

                            <div className="flex-1 relative aspect-square w-full max-w-sm md:max-w-md">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-2 border-dashed border-primary/10 rounded-full"
                                />
                                <div className="absolute inset-10 bg-gradient-to-br from-[#111] to-[#050505] rounded-full border border-white/5 flex items-center justify-center overflow-hidden">
                                    <Sparkles className="text-primary w-24 h-24 opacity-20" strokeWidth={0.5} />
                                    <img src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay" alt="Jewelry Detail" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Specialized Services Grid */}
                <section className="py-24 px-6 bg-[#080808]">
                    <div className="container max-w-7xl mx-auto space-y-16">
                        <div className="text-center space-y-4">
                            <h2 className="text-4xl font-serif">Masterful Maintenance</h2>
                            <p className="text-white/40 font-light italic">Precision in every touch.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { icon: Wind, title: "Ultrasonic Spa", desc: "Digital cleaning that removes micro-dust from the deepest settings without affecting the gems." },
                                { icon: Microscope, title: "Integrity Audit", desc: "Microscopic inspection of prongs and settings to prevent the loss of precious stones." },
                                { icon: Hammer, title: "Heritage Restoration", desc: "Breathing new life into vintage family heirlooms with traditional handcrafted techniques." }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ backgroundColor: "rgba(191,155,101,0.05)" }}
                                    className="p-12 border border-white/5 bg-[#0a0a0a] rounded-3xl transition-all space-y-6"
                                >
                                    <div className="text-primary opacity-40 group-hover:opacity-100 transition-opacity">
                                        <item.icon size={48} strokeWidth={1} />
                                    </div>
                                    <h3 className="text-2xl font-serif italic text-primary">{item.title}</h3>
                                    <p className="text-white/50 font-light leading-relaxed">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Care Concierge Form */}
                <section className="py-32 px-6">
                    <div className="container max-w-6xl mx-auto">
                        <div className="bg-[#111] grid lg:grid-cols-2 rounded-[3.5rem] overflow-hidden border border-white/10 shadow-2xl">
                            <div className="relative p-16 flex flex-col justify-between">
                                <div className="absolute inset-0 bg-primary/5 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
                                <div className="relative z-10 space-y-8">
                                    <h3 className="text-5xl font-serif leading-tight">Book a <br /><span className="text-primary italic">Refresh.</span></h3>
                                    <p className="text-white/40 font-light max-w-xs leading-relaxed">
                                        Choose your service and preferred time. Our master jeweler will be ready to attend to your needs.
                                    </p>
                                </div>

                                <div className="relative z-10 pt-16 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-black font-bold">50+</div>
                                    <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold leading-tight">Years of Expertise <br />in Fine Jewelry</p>
                                </div>
                            </div>

                            <div className="p-16 bg-[#0a0a0a]">
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold ml-1">Patron Name</Label>
                                        <Input
                                            {...register('name')}
                                            placeholder="Enter your name"
                                            className="bg-transparent border-0 border-b border-white/10 rounded-none h-12 focus-visible:ring-0 focus:border-primary transition-colors text-lg font-light"
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold ml-1">Email Address</Label>
                                            <Input
                                                {...register('email')}
                                                type="email"
                                                placeholder="noble@example.com"
                                                className="bg-transparent border-0 border-b border-white/10 rounded-none h-12 focus-visible:ring-0 focus:border-primary transition-colors font-light"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold ml-1">Phone Number</Label>
                                            <Input
                                                {...register('phone')}
                                                type="tel"
                                                placeholder="+91 ...."
                                                className="bg-transparent border-0 border-b border-white/10 rounded-none h-12 focus-visible:ring-0 focus:border-primary transition-colors font-light"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase tracking-[0.3em] text-primary/40 font-bold ml-1">Service Type</Label>
                                            <Controller
                                                name="serviceType"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <SelectTrigger className="bg-transparent border-0 border-b border-white/10 rounded-none h-12 focus:ring-0 focus:border-primary px-0 text-white/80">
                                                            <SelectValue placeholder="Select service" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-[#111] border-white/10 text-white">
                                                            <SelectItem value="cleaning" className="focus:bg-primary/20">Brilliance Refresh (Cleaning)</SelectItem>
                                                            <SelectItem value="inspection">Security Audit (Inspection)</SelectItem>
                                                            <SelectItem value="repair">Artisanal Repair</SelectItem>
                                                            <SelectItem value="polishing">Mirror Polish</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold ml-1">Preferred Date</Label>
                                            <Input
                                                type="date"
                                                {...register('date')}
                                                className="bg-transparent border-0 border-b border-white/10 rounded-none h-12 focus-visible:ring-0 focus:border-primary transition-colors [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {status === 'success' && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-primary/10 border border-primary/20 text-primary flex items-center gap-3 rounded-2xl">
                                                <CheckCircle size={18} />
                                                <p className="text-[10px] uppercase tracking-widest font-bold">{message}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <Button disabled={isLoading} className="w-full bg-primary hover:bg-white hover:text-black text-black font-bold uppercase tracking-[0.4em] h-20 rounded-full transition-all duration-500 group">
                                        {isLoading ? <Loader2 className="animate-spin" /> : <span className="flex items-center gap-3">Confirm Appointment <ArrowRight className="group-hover:translate-x-2 transition-transform" /></span>}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
