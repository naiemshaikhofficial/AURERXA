'use client'

import React, { useEffect, useCallback, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, X, ShieldCheck, Fingerprint, CreditCard, ArrowLeft, Sparkles, Shield, ChevronUp, User } from 'lucide-react'

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

    const amount = Number(paymentData.amount) || 0
    const formattedAmount = amount.toLocaleString('en-IN')
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
                    {/* ========================================================= */}
                    {/* ============= DESKTOP LEFT SIDEBAR ====================== */}
                    {/* ========================================================= */}
                    <div className="
                        hidden lg:flex flex-col
                        w-[300px] shrink-0
                        bg-gradient-to-b from-[#1a1510] via-[#15110d] to-[#0f0d0a]
                        text-white relative overflow-hidden
                    ">
                        {/* Decorative glows */}
                        <div className="absolute -top-24 -right-24 w-56 h-56 bg-primary/20 blur-[100px] rounded-full" />
                        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-primary/10 blur-[80px] rounded-full" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/5 blur-[60px] rounded-full" />

                        <div className="relative z-10 flex flex-col h-full p-7">
                            {/* Brand */}
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center">
                                    <Image src="/logo-new-v2.png" alt="AURERXA" width={28} height={28} className="w-7 h-auto brightness-200" priority />
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

                            {/* Bottom brand */}
                            <div className="mt-6 pt-5 border-t border-white/[0.06]">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 text-primary/50" />
                                    <span className="text-[8px] uppercase tracking-[0.3em] text-white/25 font-medium">Secured by AURERXA</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========================================================= */}
                    {/* ============= MOBILE: BRANDED TOP BAR =================== */}
                    {/* ========================================================= */}
                    <div className="lg:hidden shrink-0 bg-gradient-to-r from-[#1a1510] via-[#16120e] to-[#1a1510] relative overflow-hidden">
                        {/* Subtle glow */}
                        <div className="absolute -top-10 right-10 w-32 h-32 bg-primary/15 blur-[60px] rounded-full" />

                        <div className="relative z-10 flex items-center justify-between px-4 pt-[env(safe-area-inset-top,12px)] pb-3" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)' }}>
                            {/* Left: Back + Brand */}
                            <div className="flex items-center gap-3">
                                <button onClick={onClose} className="text-white/60 hover:text-white transition-colors p-1 -ml-1">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg border border-primary/30 bg-primary/10 flex items-center justify-center">
                                        <Image src="/logo-new-v2.png" alt="A" width={22} height={22} className="w-[22px] h-auto brightness-200" priority />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-serif font-bold text-white leading-none mb-0.5">AURERXA</h3>
                                        <div className="flex items-center gap-1">
                                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                                            <span className="text-[8px] uppercase tracking-[0.15em] text-emerald-400/80 font-medium">Trusted Business</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: User icon */}
                            <div className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                                <User className="w-4 h-4 text-white/60" />
                            </div>
                        </div>
                    </div>

                    {/* ========================================================= */}
                    {/* ============= DESKTOP: RIGHT PANEL TOP BAR ============== */}
                    {/* ========================================================= */}
                    <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
                        {/* Desktop Top Bar */}
                        <div className="hidden lg:flex items-center justify-between px-6 py-3.5 border-b border-border/50 bg-muted/30">
                            <h4 className="text-sm font-semibold text-foreground tracking-wide">Payment Options</h4>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                                title="Close (ESC)"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Mobile: "All Payment Options" label */}
                        <div className="lg:hidden px-4 py-3 bg-background border-b border-border/30">
                            <h4 className="text-sm font-semibold text-foreground">All Payment Options</h4>
                        </div>

                        {/* ===================== IFRAME CONTAINER ===================== */}
                        <div className="relative flex-1 min-h-0 overflow-auto bg-white dark:bg-[#fafaf9]">
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
                                            <div className="w-14 h-14 lg:w-20 lg:h-20 rounded-full border-2 border-[#bf9b65]/10" />
                                            <div className="absolute inset-0 w-14 h-14 lg:w-20 lg:h-20 rounded-full border-2 border-transparent border-t-[#bf9b65] animate-spin" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <CreditCard className="w-5 h-5 lg:w-7 lg:h-7 text-[#bf9b65]/40" />
                                            </div>
                                        </div>
                                        <div className="text-center px-8">
                                            <p className="text-xs lg:text-sm font-semibold text-[#1a1a1a] uppercase tracking-[0.12em] mb-1">Connecting to Gateway</p>
                                            <p className="text-[9px] lg:text-[10px] text-[#999] uppercase tracking-[0.2em]">Establishing Secure Vault...</p>
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
                                className="relative z-10 w-full h-full border-none block"
                                scrolling="auto"
                                style={{ minHeight: '460px' }}
                                title="AURERXA Secure Payment Gateway"
                                onLoad={() => setIframeLoaded(true)}
                            />
                        </div>

                        {/* ===================== DESKTOP FOOTER ===================== */}
                        <div className="hidden lg:block shrink-0 border-t border-border/50 bg-muted/20">
                            <div className="px-6 py-3.5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 opacity-50">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">PCI-DSS</span>
                                    </div>
                                    <div className="h-3.5 w-px bg-border" />
                                    <div className="flex items-center gap-1.5 opacity-50">
                                        <Lock className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">256-bit</span>
                                    </div>
                                    <div className="h-3.5 w-px bg-border" />
                                    <span className="text-[8px] uppercase tracking-wider text-muted-foreground/50 font-medium">Secured by AURERXA</span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-[10px] uppercase font-bold tracking-[0.15em] text-muted-foreground hover:text-destructive transition-colors group flex items-center gap-2 py-1.5 px-3 rounded-md hover:bg-destructive/5"
                                >
                                    <span>Cancel</span>
                                    <kbd className="inline-flex h-4 min-w-[28px] items-center justify-center rounded border border-border bg-muted/50 px-1 text-[7px] font-mono text-muted-foreground group-hover:border-destructive/20">ESC</kbd>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ========================================================= */}
                    {/* ============= MOBILE: STICKY BOTTOM BAR ================= */}
                    {/* ========================================================= */}
                    <div className="lg:hidden shrink-0 border-t border-border bg-[#0f0d0a] text-white">
                        <div className="flex items-center justify-between px-5 py-3">
                            {/* Amount */}
                            <div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-sm text-primary font-bold">₹</span>
                                    <span className="text-xl font-bold tracking-tight tabular-nums">{formattedAmount}</span>
                                </div>
                                <button className="flex items-center gap-1 text-[9px] uppercase tracking-[0.15em] text-primary/80 font-medium mt-0.5 hover:text-primary transition-colors">
                                    View Details
                                    <ChevronUp className="w-3 h-3" />
                                </button>
                            </div>

                            {/* Cancel button */}
                            <button
                                onClick={onClose}
                                className="bg-white/10 hover:bg-white/15 border border-white/10 text-white text-[10px] uppercase tracking-[0.2em] font-bold px-6 py-3 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Trust badges row */}
                        <div className="flex items-center justify-center gap-4 px-5 pb-3 pt-0">
                            <div className="flex items-center gap-1 opacity-40">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                <span className="text-[7px] uppercase tracking-wider text-white/60 font-bold">PCI-DSS</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-40">
                                <Lock className="w-2.5 h-2.5 text-white/60" />
                                <span className="text-[7px] uppercase tracking-wider text-white/60 font-bold">SSL-256</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-40">
                                <Sparkles className="w-2.5 h-2.5 text-primary/60" />
                                <span className="text-[7px] uppercase tracking-wider text-white/40 font-bold">AURERXA</span>
                            </div>
                        </div>

                        {/* Safe area */}
                        <div className="h-[env(safe-area-inset-bottom,0px)] bg-[#0f0d0a]" />
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SecurePaymentModal;
