'use client'

import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Compass } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
            <Navbar />

            <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
                {/* Decorative Background Elements */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
                </div>

                <div className="relative z-10 max-w-2xl px-4">
                    <div className="mb-8 flex justify-center">
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-primary/20 bg-card/50 backdrop-blur-sm">
                            <Compass className="h-10 w-10 text-primary/80 animate-pulse" />
                            <div className="absolute inset-0 rounded-full border border-primary/10 animate-ping" />
                        </div>
                    </div>

                    <p className="mb-4 font-premium-sans text-[10px] tracking-[0.4em] text-muted-foreground uppercase">
                        Error Code 404
                    </p>

                    <h1 className="mb-6 font-serif text-5xl md:text-7xl font-light tracking-tight text-foreground italic">
                        Lost in <span className="text-primary">Elegance</span>
                    </h1>

                    <p className="mx-auto mb-12 max-w-md font-serif text-lg leading-relaxed text-muted-foreground">
                        The path you followed seems to have vanished into the ether. Perhaps it was never meant to be found, or it has simply evolved.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link href="/">
                            <Button className="h-14 px-10 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground font-premium-sans text-[11px] tracking-[0.2em] transition-all duration-500 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                                Back to Home
                            </Button>
                        </Link>

                        <Link href="/collections" className="group flex items-center gap-3 font-premium-sans text-[10px] tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors duration-500">
                            <ArrowLeft className="h-4 w-4 transition-transform duration-500 group-hover:-translate-x-2" />
                            Return to Catalog
                        </Link>
                    </div>
                </div>

                {/* Framing Borders */}
                <div className="absolute top-12 left-12 bottom-12 right-12 border border-border pointer-events-none hidden md:block" />
                <div className="absolute top-24 left-24 bottom-24 right-24 border border-border/50 pointer-events-none hidden md:block" />
            </main>

            <Footer />
        </div>
    )
}
