'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X, ShieldCheck, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useConsent } from '@/context/consent-context'

export function CookieConsent() {
    const {
        consentStatus,
        preferences,
        setConsent,
        showPreferenceManager,
        setShowPreferenceManager
    } = useConsent()

    const [isVisible, setIsVisible] = useState(false)
    const [tempPrefs, setTempPrefs] = useState(preferences)

    useEffect(() => {
        if (consentStatus === 'undecided') {
            const timer = setTimeout(() => setIsVisible(true), 2000)
            return () => clearTimeout(timer)
        } else {
            setIsVisible(false)
        }
    }, [consentStatus])

    useEffect(() => {
        setTempPrefs(preferences)
    }, [preferences])

    if (!isVisible && !showPreferenceManager) return null

    const handleAcceptAll = () => {
        setConsent('granted', {
            functional: true,
            statistical: true,
            personalization: true
        })
        setIsVisible(false)
        setShowPreferenceManager(false)
    }

    const handleSavePreferences = () => {
        const isAnyGranted = tempPrefs.statistical || tempPrefs.personalization
        setConsent(isAnyGranted ? 'granted' : 'denied', tempPrefs)
        setIsVisible(false)
        setShowPreferenceManager(false)
    }

    const handleDeclineAll = () => {
        setConsent('denied', {
            functional: true,
            statistical: false,
            personalization: false
        })
        setIsVisible(false)
        setShowPreferenceManager(false)
    }

    return (
        <>
            <AnimatePresence>
                {isVisible && !showPreferenceManager && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-6 right-6 z-[100] md:left-auto md:right-10 md:w-[420px]"
                    >
                        <div className="bg-black/90 backdrop-blur-2xl border border-white/10 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

                            <div className="flex flex-col gap-6">
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-white tracking-[0.3em] uppercase flex items-center gap-3">
                                        Cookie Excellence
                                        <div className="h-px w-8 bg-amber-500/40" />
                                    </h3>
                                    <p className="text-[10px] text-white/50 font-light leading-relaxed uppercase tracking-wider">
                                        Accept cookies to make your browsing experience better. We utilize refined cookies to understand your luxury journey.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={handleAcceptAll}
                                        className="w-full bg-white text-black hover:bg-neutral-200 h-14 rounded-none text-[10px] font-bold uppercase tracking-[0.2em]"
                                    >
                                        Accept Excellence
                                    </Button>

                                    <div className="flex items-center justify-between px-1">
                                        <button
                                            onClick={handleDeclineAll}
                                            className="text-[9px] text-white/30 hover:text-white uppercase tracking-[0.2em] transition-colors"
                                        >
                                            Decline All
                                        </button>
                                        <button
                                            onClick={() => setShowPreferenceManager(true)}
                                            className="text-[9px] text-amber-500/60 hover:text-amber-500 uppercase tracking-[0.2em] transition-colors flex items-center gap-2"
                                        >
                                            Configure Journey <ShieldCheck className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showPreferenceManager && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-2xl bg-neutral-950 border border-white/5 shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 md:p-12 space-y-10">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-serif italic text-white/90">Your cookie preferences</h2>
                                        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Privacy & Personalization</p>
                                    </div>
                                    <button onClick={() => setShowPreferenceManager(false)} className="text-white/20 hover:text-white transition-colors">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-8 max-h-[50vh] overflow-y-auto pr-4 no-scrollbar">
                                    <section className="space-y-4">
                                        <p className="text-[11px] text-white/50 leading-relaxed font-light">
                                            A cookie is a small text file that is stored on your device when you visit an online service.
                                            It identifies your device during the period of validity of consent, which does not exceed 13 months.
                                        </p>
                                    </section>

                                    <div className="space-y-6">
                                        {/* Functional */}
                                        <div className="group border border-white/5 p-6 hover:bg-white/[0.02] transition-colors">
                                            <div className="flex items-start justify-between gap-6">
                                                <div className="space-y-2">
                                                    <h4 className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                                        Functional cookies <span className="text-[8px] text-white/20 font-normal italic">(Non-optional)</span>
                                                    </h4>
                                                    <p className="text-[10px] text-white/40 leading-relaxed font-light">
                                                        Required for optimum operation. They allow us to offer key functions like language, account access, shopping bag, and fraud protection.
                                                    </p>
                                                </div>
                                                <div className="w-5 h-5 border border-white/20 bg-white/10 flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-white" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Statistical */}
                                        <div
                                            onClick={() => setTempPrefs(p => ({ ...p, statistical: !p.statistical }))}
                                            className="group border border-white/5 p-6 hover:bg-white/[0.02] cursor-pointer transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-6">
                                                <div className="space-y-2">
                                                    <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Statistical analysis cookies</h4>
                                                    <p className="text-[10px] text-white/40 leading-relaxed font-light">
                                                        Used to measure and analyse our website audience (visitor volume, pages viewed, time) to help us improve performance.
                                                    </p>
                                                </div>
                                                <div className={`w-5 h-5 border transition-all duration-300 flex items-center justify-center ${tempPrefs.statistical ? 'border-amber-500 bg-amber-500/20' : 'border-white/10'}`}>
                                                    {tempPrefs.statistical && <div className="w-2 h-2 bg-amber-500" />}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Personalization */}
                                        <div
                                            onClick={() => setTempPrefs(p => ({ ...p, personalization: !p.personalization }))}
                                            className="group border border-white/5 p-6 hover:bg-white/[0.02] cursor-pointer transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-6">
                                                <div className="space-y-2">
                                                    <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Cookies to personalize the experience</h4>
                                                    <p className="text-[10px] text-white/40 leading-relaxed font-light">
                                                        Allow us to provide recommendations of products, services and content that match your preferences and remember your identity (Email, Phone) across sessions.
                                                    </p>
                                                </div>
                                                <div className={`w-5 h-5 border transition-all duration-300 flex items-center justify-center ${tempPrefs.personalization ? 'border-amber-500 bg-amber-500/20' : 'border-white/10'}`}>
                                                    {tempPrefs.personalization && <div className="w-2 h-2 bg-amber-500" />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-white/5">
                                    <Button
                                        onClick={handleSavePreferences}
                                        className="flex-1 bg-white text-black hover:bg-neutral-200 h-14 rounded-none text-[10px] font-bold uppercase tracking-[0.2em]"
                                    >
                                        Save Selection
                                    </Button>
                                    <Button
                                        onClick={handleAcceptAll}
                                        variant="outline"
                                        className="flex-1 border-white/10 text-white hover:bg-white/5 h-14 rounded-none text-[10px] font-bold uppercase tracking-[0.2em]"
                                    >
                                        Accept All
                                    </Button>
                                    <Button
                                        onClick={handleDeclineAll}
                                        variant="ghost"
                                        className="flex-1 text-white/30 hover:text-white h-14 rounded-none text-[10px] font-bold uppercase tracking-[0.2em]"
                                    >
                                        Refuse Excellence
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-neutral-900/50 py-4 text-center border-t border-white/5">
                                <span className="text-[8px] text-white/20 uppercase tracking-[0.5em] font-serif">AURERXA ARCHIVE &bull; LEGAL COMPLIANCE</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
