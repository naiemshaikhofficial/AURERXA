'use client'

import React, { useEffect, useCallback, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, X, ShieldCheck, Fingerprint, CreditCard, ArrowLeft, Sparkles, Shield } from 'lucide-react'

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
                className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center bg-black/70 backdrop-blur-md"
                onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
            >
                {/* ==================== MODAL CONTAINER ==================== */}
                <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="
                        w-full h-full
                        lg:h-[85vh] lg:max-h-[680px] lg:max-w-[920px] lg:rounded-2xl
                        bg-background text-foreground
                        border-0 lg:border lg:border-border/30
                        shadow-2xl relative overflow-hidden
                        flex flex-col lg:flex-row
                    "
                >
                    {/* ==================== LEFT SIDEBAR (Desktop Only) ==================== */}
                    <div className="
                        hidden lg:flex flex-col
                        w-[300px] shrink-0
                        bg-gradient-to-b from-[#1a1510] via-[#15110d] to-[#0f0d0a]
                        dark:from-[#1a1510] dark:via-[#15110d] dark:to-[#0f0d0a]
                        text-white relative overflow-hidden
                    ">
                        {/* Decorative glows */}
                        <div className="absolute -top-24 -right-24 w-56 h-56 bg-primary/20 blur-[100px] rounded-full" />
                        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-primary/10 blur-[80px] rounded-full" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/5 blur-[60px] rounded-full" />

                        {/* Content */}
                        <div className="relative z-10 flex flex-col h-full p-7">
                            {/* Brand */}
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center">
                                    <Image
                                        src="/logo-new-v2.png"
                                        alt="AURERXA"
                                        width={28}
                                        height={28}
                                        className="w-7 h-auto brightness-200"
                                        priority
                                    />
                                </div>
                                <div>
                                    <h3 className="text-base font-serif font-bold text-white tracking-wide">AURERXA</h3>
                                    <div className="flex items-center gap-1.5">
                                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                                        <span className="text-[9px] uppercase tracking-[0.2em] text-emerald-400/80 font-medium">Verified Business</span>
                                    </div>
                                </div>
                            </div>

                            {/* Price Summary Card */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6 backdrop-blur-sm">
                                <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-medium">Amount Payable</span>
                                <div className="flex items-baseline gap-1.5 mt-2">
                                    <span className="text-lg text-primary font-bold">₹</span>
                                    <span className="text-4xl font-bold tracking-tight tabular-nums">{formattedAmount}</span>
                                </div>
                                <div className="h-px bg-gradient-to-r from-primary/30 to-transparent my-4" />
                                <div className="flex items-center gap-2">
                                    <Lock className="w-3 h-3 text-emerald-400/70" />
                                    <span className="text-[9px] uppercase tracking-[0.2em] text-white/50">Encrypted Transaction</span>
                                </div>
                            </div>

                            {/* Security Badges */}
                            <div className="space-y-3 mb-auto">
                                <div className="flex items-center gap-3 px-4 py-2.5 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                                    <Shield className="w-4 h-4 text-primary/70" />
                                    <div>
                                        <span className="text-[10px] font-semibold text-white/80 block">PCI-DSS Compliant</span>
                                        <span className="text-[8px] text-white/30 uppercase tracking-wider">Level 1 Security</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 px-4 py-2.5 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                                    <Lock className="w-4 h-4 text-emerald-500/70" />
                                    <div>
                                        <span className="text-[10px] font-semibold text-white/80 block">256-bit SSL Encryption</span>
                                        <span className="text-[8px] text-white/30 uppercase tracking-wider">Bank-Grade Security</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 px-4 py-2.5 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                                    <Fingerprint className="w-4 h-4 text-blue-400/70" />
                                    <div>
                                        <span className="text-[10px] font-semibold text-white/80 block">3D Secure Authentication</span>
                                        <span className="text-[8px] text-white/30 uppercase tracking-wider">Verified by Visa / Mastercard</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom brand mark */}
                            <div className="mt-6 pt-5 border-t border-white/[0.06]">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 text-primary/50" />
                                    <span className="text-[8px] uppercase tracking-[0.3em] text-white/25 font-medium">Secured by AURERXA</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ==================== MOBILE HEADER ==================== */}
                    <div className="lg:hidden relative overflow-hidden shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1510] via-[#15110d] to-[#0f0d0a]" />
                        <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/15 blur-[80px] rounded-full" />

                        <div className="relative z-10 px-5 pt-12 pb-5">
                            {/* Top Row */}
                            <div className="flex items-center justify-between mb-4">
                                <button onClick={onClose} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group">
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Back</span>
                                </button>
                                <div className="w-10 h-10 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center">
                                    <Image src="/logo-new-v2.png" alt="AURERXA" width={28} height={28} className="w-7 h-auto brightness-200" priority />
                                </div>
                            </div>

                            {/* Brand + Amount */}
                            <div className="flex items-end justify-between gap-4">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] uppercase tracking-[0.35em] text-primary font-bold">AURERXA</span>
                                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                                    </div>
                                    <h3 className="text-xl font-serif font-bold text-white leading-tight">
                                        Secure <span className="text-primary italic">Payment</span>
                                    </h3>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[8px] text-white/40 uppercase tracking-[0.25em] mb-0.5">Amount</span>
                                    <div className="flex items-baseline gap-0.5">
                                        <span className="text-sm text-primary font-bold">₹</span>
                                        <span className="text-2xl font-bold text-white tracking-tight tabular-nums">{formattedAmount}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Security Pills */}
                            <div className="flex items-center gap-2 mt-3">
                                <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                    <Lock className="w-2 h-2 text-emerald-400" />
                                    <span className="text-[7px] uppercase tracking-wider text-emerald-400 font-semibold">SSL</span>
                                </div>
                                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/20 rounded-full">
                                    <ShieldCheck className="w-2 h-2 text-primary" />
                                    <span className="text-[7px] uppercase tracking-wider text-primary font-semibold">PCI-DSS</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    </div>

                    {/* ==================== RIGHT PANEL: PAYMENT IFRAME ==================== */}
                    <div className="flex-1 flex flex-col min-w-0 min-h-0">
                        {/* Desktop Top Bar */}
                        <div className="hidden lg:flex items-center justify-between px-6 py-3.5 border-b border-border/50 bg-muted/30">
                            <h4 className="text-sm font-semibold text-foreground tracking-wide">Payment Options</h4>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors group"
                                title="Close (ESC)"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* iFrame Container */}
                        <div className="relative flex-1 min-h-0 overflow-hidden bg-white dark:bg-[#fafaf9]">
                            {/* Loading State */}
                            <AnimatePresence>
                                {!iframeLoaded && (
                                    <motion.div
                                        initial={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-white dark:bg-[#fafaf9]"
                                    >
                                        <div className="relative">
                                            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full border-2 border-[#bf9b65]/10" />
                                            <div className="absolute inset-0 w-16 h-16 lg:w-20 lg:h-20 rounded-full border-2 border-transparent border-t-[#bf9b65] animate-spin" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <CreditCard className="w-6 h-6 lg:w-7 lg:h-7 text-[#bf9b65]/40" />
                                            </div>
                                        </div>
                                        <div className="text-center px-8">
                                            <p className="text-sm font-semibold text-[#1a1a1a] uppercase tracking-[0.12em] mb-1.5">Connecting to Gateway</p>
                                            <p className="text-[10px] text-[#999] uppercase tracking-[0.2em]">Establishing Secure Vault...</p>
                                        </div>
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

                            <iframe
                                name="payment_iframe"
                                id="payment_iframe"
                                src={iframeSrc}
                                className="relative z-10 w-full h-full border-none"
                                style={{ minHeight: '460px' }}
                                title="AURERXA Secure Payment Gateway"
                                onLoad={() => setIframeLoaded(true)}
                            />
                        </div>

                        {/* Footer */}
                        <div className="shrink-0 border-t border-border/50 bg-background lg:bg-muted/20">
                            <div className="px-5 py-3 lg:px-6 lg:py-3.5 flex items-center justify-between">
                                <div className="flex items-center gap-3 lg:gap-4">
                                    <div className="flex items-center gap-1.5 opacity-50">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-[8px] lg:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">PCI-DSS</span>
                                    </div>
                                    <div className="h-3.5 w-px bg-border" />
                                    <div className="flex items-center gap-1.5 opacity-50">
                                        <Lock className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-[8px] lg:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">256-bit</span>
                                    </div>
                                    <div className="h-3.5 w-px bg-border hidden lg:block" />
                                    <span className="hidden lg:inline text-[8px] uppercase tracking-wider text-muted-foreground/50 font-medium">Secured by AURERXA</span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-[9px] lg:text-[10px] uppercase font-bold tracking-[0.15em] text-muted-foreground hover:text-destructive transition-colors group flex items-center gap-2 py-1.5 px-3 rounded-md hover:bg-destructive/5"
                                >
                                    <span>Cancel</span>
                                    <kbd className="hidden lg:inline-flex h-4 min-w-[28px] items-center justify-center rounded border border-border bg-muted/50 px-1 text-[7px] font-mono text-muted-foreground group-hover:border-destructive/20">ESC</kbd>
                                </button>
                            </div>
                            <div className="h-[env(safe-area-inset-bottom,0px)] bg-background lg:hidden" />
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SecurePaymentModal;
