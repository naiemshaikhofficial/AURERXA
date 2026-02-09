'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">

            <div className="w-full max-w-md bg-card border border-border p-8 md:p-12 relative z-10 shadow-2xl text-center">
                <div className="mb-10">
                    <Link href="/">
                        <img src="/logo.png" alt="Aurerxa" className="h-24 mx-auto mb-6 opacity-90 dark:invert-0 invert" />
                    </Link>

                    <div className="w-20 h-20 mx-auto rounded-full border border-emerald-500/30 flex items-center justify-center bg-emerald-500/5 mb-8">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>

                    <h2 className="text-3xl font-serif font-bold text-foreground mb-4 italic">Email Verified</h2>
                    <p className="text-muted-foreground text-sm mb-2">Welcome to the inner circle of Aurerxa.</p>
                    <p className="text-primary/80 font-medium text-sm">Your account is now fully active.</p>
                </div>

                <div className="space-y-6 pt-4">
                    <div className="p-4 bg-primary/5 border border-primary/10 text-muted-foreground text-sm leading-relaxed italic">
                        "Luxury is not a necessity, it is a way of life."
                    </div>

                    <Link href="/login">
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-[0.2em] h-14 transition-all duration-500 group">
                            Sign In to Explore
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>

                <div className="mt-12">
                    <p className="text-[10px] text-muted-foreground/30 uppercase tracking-[0.4em]">Aurerxa • Exclusivity Redefined</p>
                </div>
            </div>
        </div>
    )
}
