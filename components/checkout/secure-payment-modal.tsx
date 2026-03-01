'use client'

import React, { useEffect, useCallback, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, X, ShieldCheck, Fingerprint, CreditCard, ArrowLeft } from 'lucide-react'

interface SecurePaymentModalProps {
    isOpen: boolean
    onClose: () => void
    paymentData: {
        actionUrl: string
        merchantId: string
        encRequest: string
        accessCode: string
        amount?: number | string
    } | null
}

const SecurePaymentModal = ({ isOpen, onClose, paymentData }: SecurePaymentModalProps) => {
    const [iframeLoaded, setIframeLoaded] = useState(false)

    // ESC key to close
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
    }, [onClose])

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
            setIframeLoaded(false)
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [isOpen, handleKeyDown])

    if (!isOpen || !paymentData) return null;

    const formattedAmount = (Number(paymentData.amount) || 0).toLocaleString('en-IN')
    const iframeSrc = `${paymentData.actionUrl}&merchant_id=${paymentData.merchantId}&encRequest=${paymentData.encRequest}&access_code=${paymentData.accessCode}`

    return (
        <AnimatePresence>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md"
                onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
            >
                {/* Modal Container — fullscreen on mobile, centered dialog on desktop */}
                <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="
                        w-full h-full
                        sm:h-auto sm:max-h-[92vh] sm:max-w-[520px] sm:rounded-2xl
                        bg-background text-foreground
                        border-0 sm:border sm:border-border/50
                        shadow-2xl relative overflow-hidden
                        flex flex-col
                    "
                >
                    {/* ===================== BRANDED HEADER ===================== */}
                    <div className="relative overflow-hidden shrink-0">
                        {/* Background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 dark:from-[#0c0a09] dark:via-[#0f0d0c] dark:to-primary/10" />

                        {/* Decorative gold accent glow */}
                        <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/15 blur-[80px] rounded-full" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 blur-[60px] rounded-full" />

                        {/* Header Content */}
                        <div className="relative z-10 px-5 pt-5 pb-5 sm:px-7 sm:pt-6 sm:pb-6">
                            {/* Top Row - Back button + Logo */}
                            <div className="flex items-center justify-between mb-5 sm:mb-6">
                                <button
                                    onClick={onClose}
                                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                                >
                                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-0.5 transition-transform" />
                                    <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium">Back</span>
                                </button>

                                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 flex items-center justify-center backdrop-blur-sm">
                                    <Image
                                        src="/logo-new-v2.png"
                                        alt="AURERXA"
                                        width={36}
                                        height={36}
                                        className="w-8 sm:w-9 h-auto dark:brightness-150 brightness-0"
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Brand + Amount Row */}
                            <div className="flex items-end justify-between gap-4">
                                <div className="flex flex-col gap-1.5 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.35em] text-primary font-bold">AURERXA</span>
                                        <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent max-w-[60px]" />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground leading-tight tracking-tight">
                                        Secure <span className="text-primary italic">Payment</span>
                                    </h3>
                                    <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                                        Heritage Encrypted Transaction
                                    </p>
                                </div>

                                {/* Amount Badge */}
                                <div className="flex flex-col items-end shrink-0">
                                    <span className="text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-[0.25em] mb-1">Amount</span>
                                    <div className="flex items-baseline gap-0.5">
                                        <span className="text-sm sm:text-base text-primary font-bold">₹</span>
                                        <span className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight tabular-nums">{formattedAmount}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Security Pills */}
                            <div className="flex items-center gap-2 mt-4 sm:mt-5">
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 rounded-full">
                                    <Lock className="w-2.5 h-2.5 text-emerald-500" />
                                    <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400 font-semibold">SSL Encrypted</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/5 dark:bg-primary/10 border border-primary/15 rounded-full">
                                    <ShieldCheck className="w-2.5 h-2.5 text-primary" />
                                    <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] text-primary font-semibold">PCI-DSS</span>
                                </div>
                                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/50 border border-border/50 rounded-full">
                                    <Fingerprint className="w-2.5 h-2.5 text-muted-foreground" />
                                    <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">3D Secure</span>
                                </div>
                            </div>
                        </div>

                        {/* Separator line */}
                        <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    </div>

                    {/* ===================== IFRAME CONTAINER ===================== */}
                    <div className="relative flex-1 min-h-0 overflow-hidden bg-white dark:bg-[#fafaf9]">
                        {/* Loading State — shown until iframe loads */}
                        <AnimatePresence>
                            {!iframeLoaded && (
                                <motion.div
                                    initial={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-white dark:bg-[#fafaf9]"
                                >
                                    {/* Premium Spinner */}
                                    <div className="relative">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#bf9b65]/10" />
                                        <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-transparent border-t-[#bf9b65] animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 text-[#bf9b65]/40" />
                                        </div>
                                    </div>

                                    <div className="text-center px-8">
                                        <p className="text-sm font-semibold text-[#1a1a1a] uppercase tracking-[0.12em] mb-1.5">
                                            Connecting to Gateway
                                        </p>
                                        <p className="text-[10px] text-[#999] uppercase tracking-[0.2em]">
                                            Establishing Secure Vault...
                                        </p>
                                    </div>

                                    {/* Animated dots */}
                                    <div className="flex items-center gap-1.5">
                                        {[0, 1, 2].map((i) => (
                                            <motion.div
                                                key={i}
                                                className="w-1.5 h-1.5 rounded-full bg-[#bf9b65]/60"
                                                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                                                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Payment Gateway iFrame */}
                        <iframe
                            name="payment_iframe"
                            id="payment_iframe"
                            src={iframeSrc}
                            className="relative z-10 w-full h-full border-none"
                            style={{ minHeight: '480px' }}
                            title="AURERXA Secure Payment Gateway"
                            onLoad={() => setIframeLoaded(true)}
                        />
                    </div>

                    {/* ===================== FOOTER ===================== */}
                    <div className="shrink-0 border-t border-border/50 bg-background">
                        <div className="px-5 py-3.5 sm:px-7 sm:py-4 flex items-center justify-between">
                            {/* Trust Badges */}
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="flex items-center gap-1.5 opacity-50">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">PCI-DSS</span>
                                </div>
                                <div className="h-3.5 w-px bg-border hidden sm:block" />
                                <div className="flex items-center gap-1.5 opacity-50">
                                    <Lock className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">256-bit</span>
                                </div>
                                <div className="h-3.5 w-px bg-border hidden sm:block" />
                                <div className="hidden sm:flex items-center gap-1.5 opacity-40">
                                    <Image src="/pngegg.png" alt="BIS" width={14} height={14} className="dark:invert invert-0 opacity-60" />
                                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">BIS Certified</span>
                                </div>
                            </div>

                            {/* Cancel Button */}
                            <button
                                onClick={onClose}
                                className="
                                    text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.15em]
                                    text-muted-foreground hover:text-destructive
                                    transition-colors group flex items-center gap-2
                                    py-1.5 px-3 rounded-md hover:bg-destructive/5
                                "
                            >
                                <span>Cancel</span>
                                <kbd className="hidden sm:inline-flex h-4 min-w-[28px] items-center justify-center rounded border border-border bg-muted/50 px-1 text-[7px] font-mono text-muted-foreground group-hover:border-destructive/20">
                                    ESC
                                </kbd>
                            </button>
                        </div>

                        {/* Mobile safe area padding */}
                        <div className="h-[env(safe-area-inset-bottom,0px)] bg-background sm:hidden" />
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SecurePaymentModal;
