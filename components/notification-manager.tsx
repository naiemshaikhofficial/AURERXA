'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, X } from 'lucide-react'
import { Button } from './ui/button'
import { saveSubscription } from '@/app/push-actions'
import { motion, AnimatePresence } from 'framer-motion'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

export function NotificationManager() {
    const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default')
    const [showPrompt, setShowPrompt] = useState(false)

    useEffect(() => {
        if (!('Notification' in window)) {
            setPermission('unsupported')
            return
        }

        setPermission(Notification.permission)

        // Show prompt if not yet decided and not dismissed
        if (Notification.permission === 'default' && !localStorage.getItem('notificationPromptDismissed')) {
            const timer = setTimeout(() => setShowPrompt(true), 5000)
            return () => clearTimeout(timer)
        }
    }, [])

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4)
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
        const rawData = window.atob(base64)
        const outputArray = new Uint8Array(rawData.length)
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i)
        }
        return outputArray
    }

    const subscribeToPush = async () => {
        try {
            const registration = await navigator.serviceWorker.ready

            // Register custom push worker script if not already handled
            // Note: Since we use next-pwa, it might have its own SW. 
            // We append our logic or register alongside if needed.
            // For this setup, we assume sw-push.js is accessible.

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!)
            })

            const res = await saveSubscription(JSON.parse(JSON.stringify(subscription)))
            if (res.success) {
                setPermission('granted')
                setShowPrompt(false)
            }
        } catch (err) {
            console.error('Failed to subscribe to push mathod:', err)
        }
    }

    const requestPermission = async () => {
        const result = await Notification.requestPermission()
        setPermission(result)
        if (result === 'granted') {
            await subscribeToPush()
        }
    }

    const handleDismiss = () => {
        setShowPrompt(false)
        localStorage.setItem('notificationPromptDismissed', 'true')
    }

    if (permission === 'unsupported' || permission === 'granted' || !showPrompt) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="fixed top-24 right-4 z-[110] max-w-sm hidden md:block"
            >
                <div className="bg-black/90 backdrop-blur-2xl border border-amber-500/30 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
                    <div className="flex justify-between items-start gap-4 mb-4">
                        <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500">
                            <Bell className="w-5 h-5" />
                        </div>
                        <button onClick={handleDismiss} className="text-white/20 hover:text-white"><X size={18} /></button>
                    </div>

                    <h4 className="text-white font-serif text-lg mb-2 italic">Stay Informed</h4>
                    <p className="text-white/50 text-xs leading-relaxed mb-6 font-premium-sans tracking-wide">
                        Be the first to know about our new artisanal masterpieces and exclusive luxury releases.
                    </p>

                    <Button
                        onClick={requestPermission}
                        className="w-full bg-amber-500 text-black hover:bg-amber-400 font-black text-[10px] uppercase tracking-widest rounded-xl py-6"
                    >
                        Enable Notifications
                    </Button>
                </div>
            </motion.div>

            {/* Mobile Version - Bottom Bar */}
            <motion.div
                initial={{ y: 200 }}
                animate={{ y: 0 }}
                className="fixed bottom-32 left-4 right-4 z-[110] md:hidden"
            >
                <div className="bg-neutral-900 border border-amber-500/20 rounded-3xl p-4 flex items-center justify-between gap-4 shadow-2xl">
                    <div className="flex items-center gap-3">
                        <Bell className="text-amber-500 w-5 h-5" />
                        <span className="text-white text-[11px] font-bold uppercase tracking-wider">Get Release Alerts?</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleDismiss} className="text-[10px] text-white/40 uppercase tracking-widest px-3">Later</button>
                        <Button onClick={requestPermission} className="bg-amber-500 text-black h-9 text-[10px] font-bold uppercase px-4 rounded-xl">Allow</Button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
