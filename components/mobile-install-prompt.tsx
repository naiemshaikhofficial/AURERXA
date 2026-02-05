'use client'

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from './ui/button'

export function MobileInstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

    useEffect(() => {
        // Check if running on mobile
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

        // Listen for PWA install event
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
            if (isMobile) {
                setShowPrompt(true)
            }
        })

        // If strictly just for "Standard Procedure" mockup for now if PWA not fully set up
        // We can force show it for verification if needed, but let's default to logic
        // Or just show it once per session for the "effect" as requested by user
        if (isMobile && !localStorage.getItem('installPromptDismissed')) {
            setShowPrompt(true)
        }

    }, [])

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            if (outcome === 'accepted') {
                setDeferredPrompt(null)
            }
        } else {
            // Fallback or just "Add to Home Screen" instructions
            alert('To install: Tap the share button and select "Add to Home Screen"')
        }
        setShowPrompt(false)
    }

    const handleDismiss = () => {
        setShowPrompt(false)
        localStorage.setItem('installPromptDismissed', 'true')
    }

    if (!showPrompt) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden animate-in slide-in-from-bottom-full duration-500">
            <div className="bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center border border-white/10">
                        <img src="/logo.png" alt="Icon" className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                        <h4 className="text-white font-medium text-sm">Install App</h4>
                        <p className="text-white/40 text-xs">Better experience, faster access</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleInstallClick}
                        className="h-9 bg-amber-500 text-black hover:bg-amber-400 font-bold text-xs"
                    >
                        Install
                    </Button>
                    <button
                        onClick={handleDismiss}
                        className="p-2 text-white/40 hover:text-white"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        </div>
    )
}
