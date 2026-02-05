'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background Luxury Elements */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23D4AF37%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />

            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-8 md:p-12 relative z-10 shadow-2xl text-center">
                <div className="mb-10">
                    <Link href="/">
                        <img src="/logo.png" alt="Aurerxa" className="h-12 mx-auto mb-6 opacity-90" />
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
