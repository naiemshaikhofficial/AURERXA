'use client'

import React, { useState } from "react"
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { submitGoldHarvest } from '@/app/actions/services'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle, AlertCircle, Coins, TrendingUp, ShieldCheck, ArrowRight, Wallet, Percent, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const goldHarvestSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Valid phone number is required'),
    amount: z.string().min(1, 'Estimated monthly amount is required'),
})

type GoldHarvestValues = z.infer<typeof goldHarvestSchema>

export default function GoldHarvestPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<GoldHarvestValues>({
        resolver: zodResolver(goldHarvestSchema),
        defaultValues: { name: '', email: '', phone: '', amount: '' }
    })

    const onSubmit = async (data: GoldHarvestValues) => {
        setIsLoading(true); setStatus('idle');
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => formData.append(key, value));
            const result = await submitGoldHarvest(formData);
            if (result.success) {
                setStatus('success');
                setMessage("Your interest has been registered. A Gold Harvest consultant will reach out to you within 24 hours.");
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
                {/* Wealth & Prestige Hero */}
                <section className="relative h-[80vh] flex items-center justify-center pt-20 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(191,155,101,0.1)_0%,_transparent_50%)]" />

                    {/* Ornamental Gold background elements */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] opacity-30" />

                    <div className="container max-w-5xl mx-auto relative z-10 text-center space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-4"
                        >
                            <div className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                                <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold">The Future of Prosperity</span>
                            </div>
                            <h1 className="text-7xl md:text-9xl font-serif tracking-tight">
                                Gold <span className="italic text-primary">Harvest.</span>
                            </h1>
                            <p className="text-xl text-white/40 font-light max-w-2xl mx-auto leading-relaxed">
                                Nurture your dreams with AURERXA. A sophisticated saving scheme designed for
                                those who value timing, tradition, and the enduring value of gold.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="flex justify-center gap-16 pt-10"
                        >
                            <div className="text-center group cursor-default">
                                <div className="w-px h-20 bg-gradient-to-b from-transparent via-primary/30 to-transparent mx-auto mb-4" />
                                <p className="text-xs uppercase tracking-widest text-white/30 group-hover:text-primary transition-colors">Safety</p>
                            </div>
                            <div className="text-center group cursor-default">
                                <div className="w-px h-20 bg-gradient-to-b from-transparent via-primary/30 to-transparent mx-auto mb-4" />
                                <p className="text-xs uppercase tracking-widest text-white/30 group-hover:text-primary transition-colors">Legacy</p>
                            </div>
                            <div className="text-center group cursor-default">
                                <div className="w-px h-20 bg-gradient-to-b from-transparent via-primary/30 to-transparent mx-auto mb-4" />
                                <p className="text-xs uppercase tracking-widest text-white/30 group-hover:text-primary transition-colors">Growth</p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Strategic Benefits Section */}
                <section className="py-32 px-6">
                    <div className="container max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-12 gap-12">
                            <div className="lg:col-span-4 space-y-8">
                                <h2 className="text-4xl font-serif">Why Choose <br /><span className="text-primary italic">Gold Harvest?</span></h2>
                                <div className="h-px w-24 bg-primary/30" />
                                <p className="text-white/50 font-light leading-relaxed">
                                    Our scheme is not just a saving plan; it's a commitment to your future milestones, backed by AURERXA's 50-year legacy of trust.
                                </p>
                            </div>

                            <div className="lg:col-span-8 grid md:grid-cols-2 gap-8">
                                {[
                                    { icon: Percent, title: "Bonus Privilege", desc: "Special benefits on making charges and additional loyalty bonuses upon plan completion." },
                                    { icon: ShieldCheck, title: "Price Protection", desc: "Shield your investment from market volatility with our unique gold-weight conversion options." },
                                    { icon: Calendar, title: "Flexible Tenure", desc: "Choose a timeline that suits your goals, from short-term collections to long-term heritage pieces." },
                                    { icon: Wallet, title: "Ease of Access", desc: "Monitor your progress and manage payments seamlessly through our premium digital concierge." }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ y: -5 }}
                                        className="p-10 bg-[#0a0a0a] border border-white/5 rounded-3xl group hover:border-primary/20 transition-all"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-black transition-all">
                                            <item.icon size={24} strokeWidth={1.5} />
                                        </div>
                                        <h3 className="text-xl font-serif mb-3 italic">{item.title}</h3>
                                        <p className="text-sm text-white/40 font-light leading-relaxed">{item.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Elegant Registration */}
                <section className="py-32 bg-[#080808] relative">
                    <div className="container max-w-6xl mx-auto">
                        <div className="bg-[#111] grid lg:grid-cols-2 rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
                            <div className="p-16 space-y-8 flex flex-col justify-center border-r border-white/5">
                                <div className="space-y-4">
                                    <h3 className="text-4xl font-serif">Cultivate Your <br /><span className="text-primary italic">Fortune.</span></h3>
                                    <p className="text-white/40 font-light">
                                        Join an exclusive community of investors. Register your interest to receive a personalized proposal based on your investment capacity.
                                    </p>
                                </div>

                                <div className="py-8 border-y border-white/5">
                                    <div className="flex items-center gap-6">
                                        <div className="flex -space-x-3">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#111] bg-white/10 overflow-hidden">
                                                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="Investor" />
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Trusted by 5000+ Patrons</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-16 bg-[#0a0a0a]">
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] uppercase tracking-[0.3em] text-primary/60 font-bold">Primary Consultant</Label>
                                        <Input
                                            {...register('name')}
                                            placeholder="Enter your full name"
                                            className="bg-transparent border-0 border-b border-white/10 rounded-none h-14 focus-visible:ring-0 focus:border-primary transition-colors text-lg font-light"
                                        />
                                        {errors.name && <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold">{errors.name.message}</p>}
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <Label className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">Digital Identity</Label>
                                            <Input
                                                {...register('email')}
                                                type="email"
                                                placeholder="your@email.com"
                                                className="bg-transparent border-0 border-b border-white/10 rounded-none h-14 focus-visible:ring-0 focus:border-primary transition-colors font-light"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">Communication</Label>
                                            <Input
                                                {...register('phone')}
                                                type="tel"
                                                placeholder="+91 ...."
                                                className="bg-transparent border-0 border-b border-white/10 rounded-none h-14 focus-visible:ring-0 focus:border-primary transition-colors font-light"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">Monthly Intent (₹)</Label>
                                        <Input
                                            {...register('amount')}
                                            type="number"
                                            placeholder="e.g. 10,000"
                                            className="bg-transparent border-0 border-b border-white/10 rounded-none h-14 focus-visible:ring-0 focus:border-primary transition-colors text-lg font-light"
                                        />
                                        {errors.amount && <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold">{errors.amount.message}</p>}
                                    </div>

                                    <AnimatePresence>
                                        {status === 'success' && (
                                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-primary/10 border border-primary/20 text-primary flex items-center gap-3 rounded-2xl">
                                                <CheckCircle size={18} />
                                                <p className="text-[10px] uppercase tracking-[0.2em] font-bold">{message}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <Button
                                        disabled={isLoading}
                                        className="w-full bg-primary hover:bg-white hover:text-black text-black font-bold uppercase tracking-[0.4em] h-[72px] rounded-2xl transition-all duration-500 shadow-xl"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" /> : 'Request Consultation'}
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
