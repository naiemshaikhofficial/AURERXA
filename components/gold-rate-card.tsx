'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Info, RefreshCw, Loader2 } from 'lucide-react'
import { getGoldRates, forceSyncGoldRates } from '@/app/actions'
import { toast } from 'sonner'
export function GoldRateCard() {
    const [rates, setRates] = useState<Record<string, number>>({
        '24K': 15660,
        '22K': 14355,
        '18K': 11745,
        'Silver': 285,
        'Platinum': 5666
    })
    const [activeTab, setActiveTab] = useState<'Gold' | 'Silver' | 'Platinum'>('Gold')
    const [loading, setLoading] = useState(true)

    const fetchRates = async (isManual = false) => {
        setLoading(true)
        try {
            if (isManual) {
                const syncResult = await forceSyncGoldRates()
                if (syncResult.success && syncResult.rates) {
                    setRates(prev => ({ ...prev, ...syncResult.rates }))
                    toast.success('Market rates synchronized live')
                }
            } else {
                const data = await getGoldRates()
                if (data) {
                    setRates(data as Record<string, number>)
                }
            }
        } catch (err) {
            console.error('Fetch error:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRates(false)
    }, [])

    const handleSync = () => {
        fetchRates(true)
    }

    const tabs = [
        { id: 'Gold', label: 'Gold', sub: '24K, 22K, 18K' },
        { id: 'Silver', label: 'Silver', sub: '999 Purity' },
        { id: 'Platinum', label: 'Platinum', sub: '950 Purity' }
    ]

    const getDisplayRates = () => {
        if (activeTab === 'Gold') {
            return Object.entries(rates).filter(([k]) => ['24K', '22K', '18K'].includes(k))
        }
        return Object.entries(rates).filter(([k]) => k === activeTab)
    }

    return (
        <section className="py-24 bg-background overflow-hidden relative border-y border-border">
            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                    className="bg-card/40 backdrop-blur-md border border-border p-10 md:p-12 rounded-[2rem] overflow-hidden"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6 text-center md:text-left">
                        <div className="space-y-4 mx-auto md:mx-0">
                            <span className="text-primary/60 text-[10px] tracking-[0.4em] font-medium uppercase flex items-center justify-center md:justify-start gap-3">
                                <TrendingUp className="w-3 h-3 opacity-60" /> Live Market Rate
                            </span>
                            <h2 className="text-4xl md:text-5xl font-serif font-medium text-foreground/90 tracking-tight">
                                Market Valuation<span className="text-primary/80">.</span>
                            </h2>
                        </div>
                        <div className="hidden md:block h-12 w-[1px] bg-border mx-8" />
                        <div className="flex flex-col items-center md:items-end gap-4 mx-auto md:mx-0">
                            <p className="text-muted-foreground text-[11px] font-light tracking-widest uppercase leading-relaxed text-center md:text-right">
                                Rates updated every 8 hours via Global Bullion Market
                            </p>
                            <button
                                onClick={handleSync}
                                disabled={loading}
                                className="flex items-center gap-3 text-[10px] text-primary/40 hover:text-primary uppercase tracking-[0.2em] transition-all duration-500 hover:tracking-[0.25em] disabled:opacity-30"
                            >
                                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                Sync Live
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex justify-center md:justify-start gap-8 mb-12 border-b border-border pb-1 w-full overflow-x-auto scrollbar-hide">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`relative pb-4 px-2 transition-all duration-700 group/tab flex flex-col items-center text-center min-w-[80px]`}
                            >
                                <span className={`text-[11px] tracking-[0.2em] uppercase transition-colors duration-500 ${activeTab === tab.id ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
                                    }`}>
                                    {tab.label}
                                </span>
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute -bottom-[1px] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Rates Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative min-h-[160px]">
                        {loading && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center">
                                <div className="w-8 h-8 border-[1px] border-border border-t-primary/50 rounded-full animate-spin [animation-duration:2000ms]" />
                            </div>
                        )}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                                className="contents"
                            >
                                {getDisplayRates().map(([purity, rate], idx) => (
                                    <motion.div
                                        key={purity}
                                        className="group p-8 flex flex-col items-center space-y-5 border border-border bg-card/20 hover:bg-card/40 transition-colors duration-700 rounded-xl"
                                    >
                                        <span className="text-muted-foreground text-[10px] tracking-[0.3em] uppercase group-hover:text-primary transition-colors duration-500">
                                            {purity === 'Silver' || purity === 'Platinum' ? purity : `${purity} Gold`}
                                        </span>
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-3xl md:text-4xl font-serif text-foreground/90 tracking-tight font-light">
                                                ₹{rate.toLocaleString('en-IN')}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground/50 font-light tracking-wider uppercase">Per Gram</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Disclosure */}
                    <div className="mt-16 flex items-center justify-center gap-3 opacity-30 mix-blend-plus-lighter">
                        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-border" />
                        <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground font-light">
                            Indicative Market Rates
                        </span>
                        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-border" />
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
