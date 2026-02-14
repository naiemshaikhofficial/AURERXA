'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X, ShieldCheck, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useConsent } from '@/context/consent-context'

export function CookieConsent() {
    const { consentStatus, setConsent } = useConsent()
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Show after a small delay if undecided
        if (consentStatus === 'undecided') {
            const timer = setTimeout(() => setIsVisible(true), 1500)
            return () => clearTimeout(timer)
        } else {
            setIsVisible(false)
        }
    }, [consentStatus])

    if (!isVisible) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="fixed bottom-6 left-6 right-6 z-[100] md:left-auto md:right-10 md:w-[420px]"
            >
                <div className="relative overflow-hidden bg-black/90 backdrop-blur-xl border border-white/10 p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    {/* Decorative Gradient Overlay */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                            <Cookie className="w-5 h-5 text-primary" />
                        </div>

                        <div className="flex-1 space-y-3">
                            <div>
                                <h3 className="text-sm font-premium-sans font-medium text-white tracking-widest uppercase mb-1 flex items-center gap-2">
                                    Cookie Excellence
                                    <ShieldCheck className="w-3 h-3 text-primary/60" />
                                </h3>
                                <p className="text-[11px] text-muted-foreground font-light leading-relaxed">
                                    To provide a bespoke jewelry experience, we utilize refined cookies and secure database persistence for personalization and behavioral insights.
                                </p>
                            </div>

                            <div className="pt-2 flex flex-col gap-3">
                                <Button
                                    onClick={() => setConsent('granted')}
                                    className="w-full bg-primary text-black hover:bg-primary/90 font-premium-sans text-[10px] tracking-widest py-6 rounded-none uppercase transition-all duration-500 group"
                                >
                                    Accept Excellence
                                    <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </Button>

                                <div className="flex items-center justify-between gap-4">
                                    <button
                                        onClick={() => setConsent('denied')}
                                        className="text-[9px] font-premium-sans text-muted-foreground hover:text-white transition-colors uppercase tracking-widest outline-none"
                                    >
                                        Decline All
                                    </button>
                                    <button
                                        onClick={() => window.alert('Our personalization system captures essential device context, behavioral patterns, and contact preferences to ensure your luxury journey is seamless and remembered across every boutique visit.')}
                                        className="text-[9px] font-premium-sans text-primary/60 hover:text-primary transition-colors underline underline-offset-4 uppercase tracking-widest outline-none text-left"
                                    >
                                        Bespoke Details
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-muted-foreground hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4 stroke-1" />
                        </button>
                    </div>

                    {/* Branding accent */}
                    <div className="mt-6 pt-4 border-t border-white/5 flex justify-center">
                        <span className="text-[8px] text-primary/20 font-serif tracking-[0.5em] uppercase">AURERXA ARCHIVE</span>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
