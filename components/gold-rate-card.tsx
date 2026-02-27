'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion'
import { TrendingUp, RefreshCw, Loader2 } from 'lucide-react'
import { getGoldRates, forceSyncGoldRates } from '@/app/actions'
import { toast } from 'sonner'
export function GoldRateCard() {
    const sectionRef = useRef<HTMLElement>(null)
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    })

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    const yCard = useTransform(smoothProgress, [0, 1], [100, -100])
    const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

    const [rates, setRates] = useState<Record<string, number>>({
        '24K': 0, '22K': 0, '21K': 0, '20K': 0, '18K': 0, '14K': 0, '10K': 0, '9K': 0,
        'Silver 999': 0, 'Silver 925': 0,
        'Platinum 950': 0, 'Platinum 900': 0, 'Platinum 850': 0
    })
    const [activeTab, setActiveTab] = useState<'Gold' | 'Silver' | 'Platinum'>('Gold')
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState<string | null>(null)

    const fetchRates = async (isManual = false) => {
        setLoading(true)
        try {
            if (isManual) {
                const syncResult = await forceSyncGoldRates()
                if (syncResult.success && syncResult.rates) {
                    setRates(prev => ({ ...prev, ...syncResult.rates }))
                    setLastUpdated(new Date().toISOString())
                    toast.success('Market rates synchronized live')
                }
            } else {
                const data = await getGoldRates()
                if (data && typeof data === 'object' && 'rates' in data) {
                    setRates(prev => ({ ...prev, ...data.rates as Record<string, number> }))
                    if (data.lastUpdated) setLastUpdated(data.lastUpdated as string)
                } else if (data) {
                    // Backward compatibility
                    setRates(prev => ({ ...prev, ...data as Record<string, number> }))
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

    const getTimeAgo = (isoDate: string) => {
        const diff = Date.now() - new Date(isoDate).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return 'Just now'
        if (mins < 60) return `${mins}m ago`
        const hrs = Math.floor(mins / 60)
        if (hrs < 24) return `${hrs}h ago`
        const days = Math.floor(hrs / 24)
        return `${days}d ago`
    }

    const tabs = [
        { id: 'Gold', label: 'Gold', sub: 'All Carats' },
        { id: 'Silver', label: 'Silver', sub: '999 & 925' },
        { id: 'Platinum', label: 'Platinum', sub: '950, 900, 850' }
    ]

    const goldCaratOrder = ['24K', '22K', '21K', '20K', '18K', '14K', '10K', '9K']
    const silverOrder = ['Silver 999', 'Silver 925']

    const getDisplayRates = (): [string, number][] => {
        if (activeTab === 'Gold') {
            return goldCaratOrder
                .filter(k => rates[k] !== undefined)
                .map(k => [k, rates[k]])
        }
        if (activeTab === 'Silver') {
            return silverOrder
                .filter(k => rates[k] !== undefined)
                .map(k => [k, rates[k]])
        }
        return Object.entries(rates).filter(([k]) => k.startsWith('Platinum'))
    }

    const getLabel = (key: string) => {
        if (key.endsWith('K')) return `${key} Gold`
        return key
    }

    return (
        <section ref={sectionRef} className="py-24 bg-background overflow-hidden relative">
            <div className="max-w-5xl mx-auto px-6 relative z-10">
                <motion.div
                    style={{ y: yCard, opacity }}
                    className="bg-card/40 backdrop-blur-md border border-white/5 p-10 md:p-12 rounded-[2rem] overflow-hidden shadow-2xl"
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
                        <div className="flex flex-col items-center md:items-end gap-2 mx-auto md:mx-0">
                            <p className="text-muted-foreground/80 text-[10px] font-medium tracking-[0.2em] uppercase leading-relaxed text-center md:text-right">
                                {lastUpdated
                                    ? `Last synced ${getTimeAgo(lastUpdated)} · Updates every 8h`
                                    : 'Rates updated every 8 hours via Global Bullion Market'
                                }
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4 mb-12 w-full">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className="relative pb-4 px-2 transition-all duration-700 group/tab flex flex-col items-center text-center"
                            >
                                <span className={`text-[11px] tracking-[0.2em] uppercase transition-colors duration-500 ${activeTab === tab.id ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
                                    }`}>
                                    {tab.label}
                                </span>
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
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
                    <div className="relative min-h-[160px]">
                        {loading && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center">
                                <div className="w-8 h-8 border-[1px] border-border border-t-primary/50 rounded-full animate-spin [animation-duration:2000ms]" />
                            </div>
                        )}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                                className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full"
                            >
                                {getDisplayRates().map(([purity, rate]) => (
                                    <motion.div
                                        key={purity}
                                        className="group p-5 flex flex-col items-center space-y-3 border border-white/5 bg-card/20 hover:bg-card/40 transition-colors duration-700 rounded-xl w-full"
                                    >
                                        <span className="text-muted-foreground text-[9px] tracking-[0.2em] uppercase group-hover:text-primary transition-colors duration-500">
                                            {getLabel(purity)}
                                        </span>
                                        <div className="flex flex-col items-center gap-1 w-full">
                                            <div className="flex flex-col items-center">
                                                <span className="text-xl md:text-2xl font-serif text-foreground/90 tracking-tight font-light">
                                                    {rate > 0 ? `₹${rate.toLocaleString('en-IN')}` : '—'}
                                                </span>
                                                <span className="text-[8px] text-muted-foreground/40 font-light tracking-wider uppercase">Base Rate</span>
                                            </div>

                                            <div className="w-8 h-px bg-white/5 my-1" />

                                            <div className="flex flex-col items-center">
                                                <span className="text-sm md:text-base font-serif text-primary/80 tracking-tight">
                                                    {rate > 0 ? `₹${Math.round(rate * 1.03).toLocaleString('en-IN')}` : '—'}
                                                </span>
                                                <span className="text-[8px] text-primary/40 font-medium tracking-widest uppercase">Incl. 3% GST</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Disclosure */}
                    <div className="mt-16 flex flex-col items-center justify-center gap-2 opacity-30">
                        <span className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground font-light text-center">
                            Transparent Pricing · All Indian Taxes Displayed
                        </span>
                        <span className="text-[8px] uppercase tracking-[0.2em] text-primary/60 font-medium">
                            Market rates update live every 8 hours
                        </span>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
