'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function RootError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Elegance Interrupted:', error)
    }, [error])

    return (
        <div className="min-h-screen bg-neutral-950 text-white selection:bg-amber-500/30">
            <Navbar />

            <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
                {/* Decorative Background Elements */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/5 blur-[150px]" />
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/10 to-transparent" />
                </div>

                <div className="relative z-10 max-w-2xl px-4">
                    <div className="mb-8 flex justify-center">
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-red-500/20 bg-neutral-900/50 backdrop-blur-sm shadow-[0_0_40px_rgba(239,68,68,0.1)]">
                            <AlertTriangle className="h-10 w-10 text-red-500/80" />
                            <div className="absolute inset-x-0 bottom-[-20px] mx-auto w-12 h-[2px] bg-red-500/40 rounded-full blur-[2px]" />
                        </div>
                    </div>

                    <p className="mb-4 font-premium-sans text-[10px] tracking-[0.4em] text-red-500/60 uppercase">
                        A Moment of Interruption
                    </p>

                    <h1 className="mb-6 font-serif text-5xl md:text-7xl font-light tracking-tight text-white italic">
                        Elegance <span className="text-white/40 font-light not-italic">Interrupted</span>
                    </h1>

                    <p className="mx-auto mb-12 max-w-md font-serif text-lg leading-relaxed text-white/50">
                        We encountered an unexpected flourish during your experience. Our artisans are already resolving the matter with precision.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Button
                            onClick={() => reset()}
                            className="h-14 px-10 rounded-none bg-white text-neutral-950 hover:bg-neutral-200 font-premium-sans text-[11px] tracking-[0.2em] transition-all duration-500"
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Try Again
                        </Button>

                        <Link href="/">
                            <Button variant="outline" className="h-14 px-10 rounded-none border-white/10 text-white hover:bg-white hover:text-neutral-950 font-premium-sans text-[11px] tracking-[0.2em] transition-all duration-500">
                                Return to Home
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-16 pt-8 border-t border-white/5">
                        <p className="font-premium-sans text-[9px] tracking-[0.2em] text-white/30 uppercase uppercase">
                            Reference Code: {error.digest || 'ERR_LUX_001'}
                        </p>
                    </div>
                </div>

                {/* Global Branding Accents */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-20 hover:opacity-100 transition-opacity duration-1000">
                    <span className="font-serif text-xs tracking-[0.8em] text-amber-500">AURERX<span className="italic">A</span></span>
                </div>
            </main>

            <Footer />
        </div>
    )
}
