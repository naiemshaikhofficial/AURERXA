'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4 relative overflow-hidden">

            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-8 md:p-12 relative z-10 shadow-2xl text-center">
                <div className="mb-10">
                    <Link href="/">
                        <img src="/logo.png" alt="Aurerxa" className="h-24 mx-auto mb-6 opacity-90" />
                    </Link>

                    <div className="w-20 h-20 mx-auto rounded-full border border-green-500/30 flex items-center justify-center bg-green-500/5 mb-8">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>

                    <h2 className="text-3xl font-serif font-bold text-white mb-4 italic">Email Verified</h2>
                    <p className="text-white/50 text-sm mb-2">Welcome to the inner circle of Aurerxa.</p>
                    <p className="text-amber-500/80 font-medium text-sm">Your account is now fully active.</p>
                </div>

                <div className="space-y-6 pt-4">
                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 text-white/70 text-sm leading-relaxed italic">
                        "Luxury is not a necessity, it is a way of life."
                    </div>

                    <Link href="/login">
                        <Button className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold uppercase tracking-[0.2em] h-14 transition-all duration-500 group">
                            Sign In to Explore
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>

                <div className="mt-12">
                    <p className="text-[10px] text-white/20 uppercase tracking-[0.4em]">Aurerxa • Exclusivity Redefined</p>
                </div>
            </div>
        </div>
    )
}
