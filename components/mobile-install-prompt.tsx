'use client'

import { useState, useEffect } from 'react'
import { Download, X, Share } from 'lucide-react'
import { Button } from './ui/button'
import { motion, AnimatePresence } from 'framer-motion'

export function MobileInstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [isIOS, setIsIOS] = useState(false)
    const [showDetails, setShowDetails] = useState(false)

    useEffect(() => {
        // Detect platforms
        const ua = navigator.userAgent
        const ios = /iPhone|iPad|iPod/i.test(ua)
        const android = /Android/i.test(ua)
        setIsIOS(ios)

        // Listen for PWA install event (Android/Chrome/Edge)
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setShowPrompt(true)
        })

        // Force show prompt once on mobile if not dismissed
        // This is to capture the "Direct Install" feel the user wants
        const isMobile = ios || android
        if (isMobile && !localStorage.getItem('installPromptDismissed')) {
            const timer = setTimeout(() => setShowPrompt(true), 3000)
            return () => clearTimeout(timer)
        }

    }, [])

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            if (outcome === 'accepted') {
                setDeferredPrompt(null)
                setShowPrompt(false)
            }
        } else if (isIOS) {
            setShowDetails(true)
        } else {
            // Most modern Android browsers will have the prompt by now if manifest is valid
            // If not, we show instructions
            setShowDetails(true)
        }
    }

    const handleDismiss = () => {
        setShowPrompt(false)
        localStorage.setItem('installPromptDismissed', 'true')
    }

    if (!showPrompt) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 200, opacity: 0 }}
                className="fixed bottom-20 left-4 right-4 z-[100] md:hidden"
            >
                <div className="bg-black/90 backdrop-blur-2xl border border-amber-500/20 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
                    {!showDetails ? (
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-neutral-900 rounded-2xl flex items-center justify-center border border-white/5 p-2">
                                    <img src="/logo.png" alt="AURERXA" className="w-full h-full object-contain" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-white font-bold text-sm tracking-tight">AURERXA App</h4>
                                    <p className="text-white/50 text-[10px] uppercase tracking-widest font-medium">Timeless Luxury</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={handleInstallClick}
                                    className="h-10 bg-amber-500 text-black hover:bg-amber-400 font-black text-xs uppercase px-6 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all active:scale-95"
                                >
                                    Install
                                </Button>
                                <button
                                    onClick={handleDismiss}
                                    className="p-2 text-white/30 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6 pt-2"
                        >
                            <div className="flex justify-between items-start">
                                <h4 className="text-white font-serif italic text-xl">How to Install</h4>
                                <button onClick={() => setShowDetails(false)} className="text-white/40"><X size={18} /></button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-white/80 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-amber-500 font-bold italic">1</div>
                                    <p>Tap the <span className="text-white font-bold inline-flex items-center gap-1 mx-1 px-2 py-1 bg-white/5 rounded border border-white/10"><Share size={14} /> Share</span> button below</p>
                                </div>
                                <div className="flex items-center gap-4 text-white/80 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-amber-500 font-bold italic">2</div>
                                    <p>Scroll down and select <span className="text-white font-bold underline decoration-amber-500/50 underline-offset-4 mx-1">"Add to Home Screen"</span></p>
                                </div>
                            </div>

                            <div className="w-full h-px bg-white/5" />

                            <p className="text-[10px] text-amber-500/60 uppercase tracking-[0.4em] text-center font-bold">Experience the Legacy Directly</p>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
