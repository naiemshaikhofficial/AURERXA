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

            // Still check session dismissal before showing even if browser suggests it
            if (!sessionStorage.getItem('installPromptDismissedInSession')) {
                setShowPrompt(true)
            }
        })

        // Force show prompt if not dismissed in THIS visit/session
        const isMobile = ios || android
        const dismissedInSession = sessionStorage.getItem('installPromptDismissedInSession')

        if (isMobile && !dismissedInSession) {
            const timer = setTimeout(() => setShowPrompt(true), 15000) // 15s delay as requested previously
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
                sessionStorage.setItem('installPromptDismissedInSession', 'true')
            }
        } else if (isIOS) {
            setShowDetails(true)
        } else {
            setShowDetails(true)
        }
    }

    const handleDismiss = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setShowPrompt(false)
        sessionStorage.setItem('installPromptDismissedInSession', 'true')
    }

    if (!showPrompt) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 200, opacity: 0 }}
                className="fixed bottom-24 left-4 right-4 z-[100] md:hidden"
            >
                <div className="bg-popover/95 backdrop-blur-3xl border border-border/50 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] ring-1 ring-border/20">
                    {!showDetails ? (
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-card rounded-2xl flex items-center justify-center border border-border p-2">
                                    <img src="/logo.webp" alt="AURERXA" className="w-full h-full object-contain invert dark:invert-0" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-foreground font-bold text-sm tracking-tight">AURERXA App</h4>
                                    <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-medium">Legacy Luxury</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={handleInstallClick}
                                    className="h-10 bg-primary text-primary-foreground hover:bg-primary/90 font-black text-xs uppercase px-6 rounded-xl shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all active:scale-95"
                                >
                                    Install
                                </Button>
                                <button
                                    onClick={handleDismiss}
                                    className="p-3 -mr-2 text-muted-foreground hover:text-foreground touch-none transition-colors"
                                    aria-label="Dismiss install prompt"
                                >
                                    <X size={22} className="stroke-[2.5px]" />
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
                                <h4 className="text-foreground font-serif italic text-xl">Heritage Install</h4>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowDetails(false); }}
                                    className="p-2 -mr-1 text-muted-foreground hover:text-foreground"
                                    aria-label="Close install instructions"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-foreground/80 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border text-primary font-bold italic">1</div>
                                    <p>Tap the <span className="text-foreground font-bold inline-flex items-center gap-1 mx-1 px-2 py-1 bg-muted rounded border border-border"><Share size={14} /> Share</span> button below</p>
                                </div>
                                <div className="flex items-center gap-4 text-foreground/80 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border text-primary font-bold italic">2</div>
                                    <p>Scroll down and select <span className="text-foreground font-bold underline decoration-primary/50 underline-offset-4 mx-1">"Add to Home Screen"</span></p>
                                </div>
                            </div>

                            <div className="w-full h-px bg-border" />

                            <p className="text-[10px] text-primary/60 uppercase tracking-[0.4em] text-center font-bold">Experience the Legacy Directly</p>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
