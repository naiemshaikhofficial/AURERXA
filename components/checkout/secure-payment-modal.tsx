'use client'

import React from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, X, ShieldCheck } from 'lucide-react'

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
    if (!isOpen || !paymentData) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 40 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 40 }}
                    className="w-full h-full sm:h-auto sm:max-w-[480px] bg-white border-0 sm:border border-border shadow-2xl relative overflow-hidden flex flex-col sm:rounded-2xl"
                >
                    {/* Branded Header - Razorpay Style */}
                    <div className="bg-[#0f172a] p-5 sm:p-6 text-white flex flex-col gap-3 sm:gap-4 relative overflow-hidden pt-12 sm:pt-6">
                        {/* Decorative Gradient Accent */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16 rounded-full" />

                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-primary/80 font-bold">AURERXA Authentic Luxury</span>
                                <h3 className="text-lg sm:text-xl font-serif font-bold text-white leading-tight">Secure Payment</h3>
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center backdrop-blur-md">
                                <Image src="/logo-new-v2.png" alt="A" width={32} height={32} className="w-7 sm:w-8 h-auto brightness-200" priority />
                            </div>
                        </div>

                        <div className="flex items-end justify-between mt-1 sm:mt-2 relative z-10">
                            <div className="flex flex-col">
                                <span className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest mb-0.5">Amount Payable</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xs sm:text-sm text-primary font-bold">₹</span>
                                    <span className="text-xl sm:text-2xl font-bold tracking-tight">{(Number(paymentData.amount) || 0).toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white/5 border border-white/10 rounded-full">
                                <Lock className="w-2.5 h-2.5 text-emerald-400" />
                                <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-white/60 font-medium">Encrypted</span>
                            </div>
                        </div>

                        {/* Mobile Close Indicator */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-white/40 hover:text-white sm:hidden"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* iFrame Container - Scrollable on mobile if needed */}
                    <div className="relative flex-1 sm:flex-none w-full aspect-square sm:aspect-[4/4.5] bg-white overflow-hidden">
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-slate-50">
                            {/* Premium Loader */}
                            <div className="relative">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-primary/10 rounded-full" />
                                <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-2 border-t-primary rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-primary/40" />
                                </div>
                            </div>
                            <div className="text-center px-8">
                                <p className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-[0.1em] mb-1">Authenticating Gateway</p>
                                <p className="text-[8px] sm:text-[10px] text-slate-400 uppercase tracking-widest">Bridging to Secure Vault...</p>
                            </div>
                        </div>
                        <iframe
                            name="payment_iframe"
                            id="payment_iframe"
                            src={`${paymentData.actionUrl}&merchant_id=${paymentData.merchantId}&encRequest=${paymentData.encRequest}&access_code=${paymentData.accessCode}`}
                            className="relative z-10 w-full h-full border-none"
                            title="AURERXA Secure Payment"
                            onLoad={(e) => {
                                const loader = e.currentTarget.previousElementSibling;
                                if (loader) (loader as HTMLElement).style.display = 'none';
                            }}
                        />
                    </div>

                    {/* Responsive Footer */}
                    <div className="px-5 py-4 pb-10 sm:pb-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between mt-auto sm:mt-0">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="flex items-center gap-1.5 grayscale opacity-60">
                                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                                <span className="text-[8px] sm:text-[10px] font-bold text-slate-600 mt-0.5">PCI-DSS</span>
                            </div>
                            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                            <div className="flex items-center gap-1.5 grayscale opacity-60">
                                <Lock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-600" />
                                <span className="text-[8px] sm:text-[10px] font-bold text-slate-600 mt-0.5">SSL-256</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-slate-400 hover:text-destructive transition-colors group flex items-center gap-2 py-1 px-2"
                        >
                            <span className="sm:inline">Cancel Payment</span>
                            <span className="hidden sm:flex w-4 h-4 rounded-full border border-slate-200 items-center justify-center text-[8px] group-hover:border-destructive/30">ESC</span>
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SecurePaymentModal;
